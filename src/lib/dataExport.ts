import { Field, AnalysisResult } from './store';
import { generatePDFReport, generateFieldReport } from './pdfGenerator';

// Export single analysis as PDF
export async function exportAnalysisPDF(
  analysis: AnalysisResult,
  field: Field,
  farmName?: string
): Promise<void> {
  await generatePDFReport(analysis, field, farmName);
}

// Export field report with all analyses as PDF
export async function exportFieldPDF(
  field: Field,
  analyses: AnalysisResult[],
  farmName?: string
): Promise<void> {
  await generateFieldReport(field, analyses, farmName);
}

// Export fields to CSV
export const exportFieldsToCSV = (fields: Field[]) => {
  const headers = ['Name', 'Crop Type', 'Area (hectares)', 'Planting Date', 'Health Status', 'Last Scan'];
  const rows = fields.map(field => [
    field.name,
    field.cropType,
    field.area.toFixed(2),
    field.plantingDate,
    field.healthStatus || 'N/A',
    field.lastScan || 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, 'talazo-fields-export.csv', 'text/csv');
};

// Export analysis data as CSV
export const exportAnalysesToCSV = (analyses: AnalysisResult[]) => {
  const headers = ['Field ID', 'Date', 'Disease Detected', 'Disease Type', 'Confidence', 'Severity', 'Primary Deficiency'];
  const rows = analyses.map(analysis => [
    analysis.fieldId,
    new Date(analysis.timestamp).toLocaleDateString(),
    analysis.disease.detected ? 'Yes' : 'No',
    analysis.disease.type || 'None',
    `${analysis.disease.confidence}%`,
    analysis.disease.severity,
    analysis.nutrient.primaryDeficiency
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, 'talazo-analyses-export.csv', 'text/csv');
};

// Export to Excel (using HTML table format that Excel can open)
export const exportFieldsToExcel = (fields: Field[]) => {
  const tableHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta charset="UTF-8">
        <style>
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #059669; color: white; font-weight: bold; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Crop Type</th>
              <th>Area (hectares)</th>
              <th>Planting Date</th>
              <th>Health Status</th>
              <th>Last Scan</th>
            </tr>
          </thead>
          <tbody>
            ${fields.map(field => `
              <tr>
                <td>${field.name}</td>
                <td>${field.cropType}</td>
                <td>${field.area.toFixed(2)}</td>
                <td>${field.plantingDate}</td>
                <td>${field.healthStatus || 'N/A'}</td>
                <td>${field.lastScan || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(tableHTML, 'talazo-fields-export.xls', 'application/vnd.ms-excel');
};

// Import fields from CSV
export const importFieldsFromCSV = (file: File): Promise<Partial<Field>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header
        const dataLines = lines.slice(1);
        
        const fields = dataLines.map(line => {
          // Handle CSV with quoted fields
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
          
          return {
            name: values[0] || '',
            cropType: values[1] || '',
            area: parseFloat(values[2]) || 0,
            plantingDate: values[3] || new Date().toISOString().split('T')[0],
            healthStatus: (values[4] as 'healthy' | 'warning' | 'critical') || undefined,
            coordinates: [[0, 0], [0, 0], [0, 0], [0, 0]], // Default polygon
          };
        }).filter(field => field.name && field.cropType);

        resolve(fields);
      } catch {
        reject(new Error('Failed to parse CSV file'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Backup all app data
export const backupAllData = () => {
  const authData = localStorage.getItem('talazo-auth');
  const fieldsData = localStorage.getItem('talazo-fields');
  const analysesData = localStorage.getItem('talazo-analyses');

  const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
      auth: authData ? JSON.parse(authData) : null,
      fields: fieldsData ? JSON.parse(fieldsData) : null,
      analyses: analysesData ? JSON.parse(analysesData) : null,
    }
  };

  const backupJSON = JSON.stringify(backup, null, 2);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(backupJSON, `talazo-backup-${timestamp}.json`, 'application/json');
};

// Restore from backup
export const restoreFromBackup = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const backup = JSON.parse(text);

        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file format');
        }

        // Restore data
        if (backup.data.auth) {
          localStorage.setItem('talazo-auth', JSON.stringify(backup.data.auth));
        }
        if (backup.data.fields) {
          localStorage.setItem('talazo-fields', JSON.stringify(backup.data.fields));
        }
        if (backup.data.analyses) {
          localStorage.setItem('talazo-analyses', JSON.stringify(backup.data.analyses));
        }

        resolve(true);
      } catch {
        reject(new Error('Failed to restore backup: Invalid file format'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
};

// Helper function to trigger file download
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

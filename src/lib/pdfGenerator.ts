import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AnalysisResult, Field } from './store';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

// Generate comprehensive PDF report with real ML data
export async function generatePDFReport(
  analysis: AnalysisResult,
  field: Field,
  farmName: string = 'My Farm'
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header with logo placeholder
  doc.setFontSize(24);
  doc.setTextColor(30, 77, 43); // Talazo green
  doc.text('TALAZO AGRITECH', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Crop Health Analysis Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(30, 77, 43);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Report Details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 6;
  doc.text(`Farm: ${farmName}`, 20, yPos);
  yPos += 6;
  doc.text(`Field: ${field.name}`, 20, yPos);
  yPos += 6;
  doc.text(`Crop Type: ${field.cropType}`, 20, yPos);
  yPos += 6;
  doc.text(`Field Area: ${field.area} hectares`, 20, yPos);
  yPos += 6;
  doc.text(`Planting Date: ${field.plantingDate}`, 20, yPos);
  yPos += 10;

  // Analysis Summary Box
  doc.setFillColor(240, 248, 255);
  doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');
  yPos += 8;
  
  doc.setFontSize(14);
  doc.text('ANALYSIS SUMMARY', pageWidth / 2, yPos, { align: 'center' });
  yPos += 7;
  
  doc.setFontSize(11);
  const scanDate = new Date(analysis.timestamp).toLocaleString();
  doc.text(`Scan Date: ${scanDate}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
  
  const healthStatus = analysis.disease.detected ? 
    `⚠️ Disease Detected: ${analysis.disease.type}` : 
    '✅ No Disease Detected';
  doc.text(healthStatus, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Disease Detection Section
  doc.setFontSize(13);
  doc.text('1. DISEASE DETECTION (AI-Powered)', 20, yPos);
  yPos += 7;

  const diseaseData = [
    ['Detection Status', analysis.disease.detected ? 'POSITIVE ⚠️' : 'NEGATIVE ✓'],
    ['Disease Type', analysis.disease.type || 'None'],
    ['Confidence Level', `${analysis.disease.confidence}%`],
    ['Affected Area', `${analysis.disease.affectedArea}% of leaf surface`],
    ['Severity Rating', analysis.disease.severity.toUpperCase()],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Result']],
    body: diseaseData,
    theme: 'grid',
    headStyles: { fillColor: [30, 77, 43], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 } },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Recommendations
  if (analysis.disease.recommendations.length > 0) {
    doc.setFontSize(11);
    doc.text('Treatment Recommendations:', 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    analysis.disease.recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 45);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5 + 2;
    });
    yPos += 5;
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Nutrient Analysis Section
  doc.setFontSize(13);
  doc.text('2. NUTRIENT ANALYSIS', 20, yPos);
  yPos += 7;

  const nutrientData = [
    ['Nitrogen (N)', `${analysis.nutrient.nitrogen}%`, getNutrientStatus(analysis.nutrient.nitrogen)],
    ['Phosphorus (P)', `${analysis.nutrient.phosphorus}%`, getNutrientStatus(analysis.nutrient.phosphorus)],
    ['Potassium (K)', `${analysis.nutrient.potassium}%`, getNutrientStatus(analysis.nutrient.potassium)],
    ['Primary Deficiency', analysis.nutrient.primaryDeficiency, ''],
    ['Analysis Confidence', `${analysis.nutrient.confidence}%`, ''],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Nutrient', 'Level', 'Status']],
    body: nutrientData,
    theme: 'grid',
    headStyles: { fillColor: [30, 77, 43], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Nutrient Recommendations
  if (analysis.nutrient.recommendations.length > 0) {
    doc.setFontSize(11);
    doc.text('Nutrient Recommendations:', 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    analysis.nutrient.recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 45);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5 + 2;
    });
    yPos += 5;
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Water Stress Section
  doc.setFontSize(13);
  doc.text('3. WATER STRESS ANALYSIS', 20, yPos);
  yPos += 7;

  const waterData = [
    ['Water Status', analysis.water.status],
    ['Soil Moisture', `${analysis.water.soilMoisture}%`],
    ['Analysis Confidence', `${analysis.water.confidence}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Parameter', 'Value']],
    body: waterData,
    theme: 'grid',
    headStyles: { fillColor: [30, 77, 43], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
  });

  yPos = doc.lastAutoTable.finalY + 10;

  // Water Recommendations
  if (analysis.water.recommendations.length > 0) {
    doc.setFontSize(11);
    doc.text('Irrigation Recommendations:', 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    analysis.water.recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 45);
      doc.text(lines, 25, yPos);
      yPos += lines.length * 5 + 2;
    });
    yPos += 5;
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  // Vegetation Index (NDVI)
  doc.setFontSize(13);
  doc.text('4. VEGETATION HEALTH INDEX (NDVI)', 20, yPos);
  yPos += 7;

  const ndviData = [
    ['Average NDVI', analysis.ndvi.average.toFixed(2)],
    ['Healthy Vegetation', `${analysis.ndvi.healthy}%`],
    ['Stressed Vegetation', `${analysis.ndvi.stressed}%`],
    ['Trend', analysis.ndvi.trend],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: ndviData,
    theme: 'grid',
    headStyles: { fillColor: [30, 77, 43], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // Footer with disclaimer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('DISCLAIMER:', 20, footerY);
  doc.text('This report is generated using AI-powered crop analysis. Results should be verified', 20, footerY + 4);
  doc.text('by agricultural professionals before making major farming decisions.', 20, footerY + 8);
  doc.text('For support: support@talazo.co.zw | www.talazo.co.zw', 20, footerY + 16);
  
  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, footerY + 16);
  }

  // Save PDF
  const fileName = `${field.name}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Helper function to determine nutrient status
function getNutrientStatus(level: number): string {
  if (level < 40) return '🔴 Low';
  if (level < 65) return '🟡 Moderate';
  return '🟢 Good';
}

// Generate field report (for multiple analyses)
export async function generateFieldReport(
  field: Field,
  analyses: AnalysisResult[],
  farmName: string = 'My Farm'
): Promise<void> {
  if (analyses.length === 0) {
    throw new Error('No analyses available for this field');
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(30, 77, 43);
  doc.text('TALAZO AGRITECH', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Field Health Summary Report', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(30, 77, 43);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Field Information
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPos);
  yPos += 6;
  doc.text(`Farm: ${farmName}`, 20, yPos);
  yPos += 6;
  doc.text(`Field: ${field.name}`, 20, yPos);
  yPos += 6;
  doc.text(`Crop: ${field.cropType}`, 20, yPos);
  yPos += 6;
  doc.text(`Area: ${field.area} hectares`, 20, yPos);
  yPos += 6;
  doc.text(`Total Scans: ${analyses.length}`, 20, yPos);
  yPos += 10;

  // Analysis History Table
  doc.setFontSize(13);
  doc.text('SCAN HISTORY', 20, yPos);
  yPos += 7;

  const historyData = analyses.map((analysis) => [
    new Date(analysis.timestamp).toLocaleDateString(),
    analysis.disease.detected ? '⚠️ Yes' : '✓ No',
    analysis.disease.type || 'None',
    `${analysis.disease.confidence}%`,
    field.healthStatus || 'Unknown',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Date', 'Disease', 'Type', 'Confidence', 'Status']],
    body: historyData,
    theme: 'grid',
    headStyles: { fillColor: [30, 77, 43], textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 8 },
  });

  // Save
  const fileName = `${field.name}_FieldReport_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

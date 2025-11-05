// Precision Agriculture - Zone-based Analysis and Resource Optimization

// RGB-based NDVI approximation using Triangular Greenness Index (TGI)
// This works with standard RGB cameras without NIR sensors
export function calculatePseudoNDVI(imageData: ImageData): number {
  const { data } = imageData;
  let totalTGI = 0;
  let pixelCount = 0;

  // Sample every 10th pixel for performance (can adjust for accuracy)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Triangular Greenness Index (TGI)
    // Formula: -0.5 * [(λred - λblue)(R - G) - (λred - λgreen)(R - B)]
    // Simplified: G - 0.39*R - 0.61*B
    const tgi = g - 0.39 * r - 0.61 * b;
    
    // Normalize to -1 to 1 range (like real NDVI)
    const normalizedTGI = Math.max(-1, Math.min(1, tgi / 100));
    
    totalTGI += normalizedTGI;
    pixelCount++;
  }

  const averageNDVI = pixelCount > 0 ? totalTGI / pixelCount : 0;
  
  // Ensure it's in valid NDVI range
  return Math.max(-1, Math.min(1, averageNDVI));
}

// Alternative: Visible Atmospherically Resistant Index (VARI)
// More robust for varying atmospheric conditions
export function calculateVARI(imageData: ImageData): number {
  const { data } = imageData;
  let totalVARI = 0;
  let pixelCount = 0;

  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // VARI = (G - R) / (G + R - B)
    const denominator = g + r - b;
    if (denominator !== 0) {
      const vari = (g - r) / denominator;
      totalVARI += Math.max(-1, Math.min(1, vari));
      pixelCount++;
    }
  }

  return pixelCount > 0 ? totalVARI / pixelCount : 0;
}

// Excess Green Index (ExG) - Good for early growth stage detection
export function calculateExG(imageData: ImageData): number {
  const { data } = imageData;
  let totalExG = 0;
  let pixelCount = 0;

  for (let i = 0; i < data.length; i += 40) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

    // ExG = 2*g - r - b
    const exg = 2 * g - r - b;
    totalExG += exg;
    pixelCount++;
  }

  return pixelCount > 0 ? totalExG / pixelCount : 0;
}

// Combined vegetation index using multiple RGB-based indices
export function calculateRGBVegetationIndex(imageFile: File): Promise<{
  ndvi: number;
  vari: number;
  exg: number;
  healthScore: number;
  classification: 'excellent' | 'good' | 'moderate' | 'stressed' | 'poor';
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Resize for performance (max 800px width)
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const ndvi = calculatePseudoNDVI(imageData);
      const vari = calculateVARI(imageData);
      const exg = calculateExG(imageData);

      // Combined health score (weighted average)
      const healthScore = (ndvi * 0.5 + vari * 0.3 + exg * 0.2);

      // Classification based on combined score
      let classification: 'excellent' | 'good' | 'moderate' | 'stressed' | 'poor';
      if (healthScore > 0.7) classification = 'excellent';
      else if (healthScore > 0.5) classification = 'good';
      else if (healthScore > 0.3) classification = 'moderate';
      else if (healthScore > 0.1) classification = 'stressed';
      else classification = 'poor';

      resolve({ ndvi, vari, exg, healthScore, classification });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

// Zone-based analysis for aerial images
// Divides field into grid zones and identifies problem areas
export interface Zone {
  id: string;
  row: number;
  col: number;
  bounds: { x: number; y: number; width: number; height: number };
  healthScore: number;
  classification: 'healthy' | 'warning' | 'critical';
  problems: string[];
  prescription: {
    action: string;
    product: string;
    rate: string;
    priority: 'high' | 'medium' | 'low';
    estimatedCost: number;
  };
}

interface DiseaseDetection {
  x?: number;
  y?: number;
  class?: string;
  confidence?: number;
}

export async function analyzeFieldZones(
  imageFile: File,
  gridSize: { rows: number; cols: number } = { rows: 4, cols: 4 },
  diseaseDetections: DiseaseDetection[] = [],
  fieldArea: number = 1 // hectares
): Promise<{
  zones: Zone[];
  summary: {
    totalZones: number;
    healthyZones: number;
    warningZones: number;
    criticalZones: number;
    treatmentRequired: number;
    estimatedCostFullField: number;
    estimatedCostPrecision: number;
    savings: number;
    savingsPercentage: number;
  };
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const zones: Zone[] = [];
      const zoneWidth = canvas.width / gridSize.cols;
      const zoneHeight = canvas.height / gridSize.rows;

      // Analyze each zone
      for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          const x = col * zoneWidth;
          const y = row * zoneHeight;

          const zoneImageData = ctx.getImageData(x, y, zoneWidth, zoneHeight);
          const zoneHealth = calculatePseudoNDVI(zoneImageData);

          // Check if any disease detections fall within this zone
          const zoneDetections = diseaseDetections.filter(det => {
            const detX = det.x || 0;
            const detY = det.y || 0;
            return detX >= x && detX < x + zoneWidth && detY >= y && detY < y + zoneHeight;
          });

          const problems: string[] = [];
          let classification: 'healthy' | 'warning' | 'critical' = 'healthy';

          // Classify zone based on health score and detections
          if (zoneDetections.length > 0 || zoneHealth < 0.3) {
            classification = 'critical';
            if (zoneDetections.length > 0) {
              problems.push(`${zoneDetections.length} disease spot(s) detected`);
            }
            if (zoneHealth < 0.3) {
              problems.push('Low vegetation health');
            }
          } else if (zoneHealth < 0.5) {
            classification = 'warning';
            problems.push('Moderate stress detected');
          }

          // Generate prescription for problematic zones
          const prescription = generateZonePrescription(
            classification,
            problems,
            zoneDetections,
            fieldArea / (gridSize.rows * gridSize.cols)
          );

          zones.push({
            id: `zone-${row}-${col}`,
            row,
            col,
            bounds: { x, y, width: zoneWidth, height: zoneHeight },
            healthScore: zoneHealth,
            classification,
            problems,
            prescription,
          });
        }
      }

      // Calculate summary statistics
      const totalZones = zones.length;
      const healthyZones = zones.filter(z => z.classification === 'healthy').length;
      const warningZones = zones.filter(z => z.classification === 'warning').length;
      const criticalZones = zones.filter(z => z.classification === 'critical').length;
      const treatmentRequired = warningZones + criticalZones;

      // Cost calculations
      const estimatedCostPrecision = zones.reduce((sum, zone) => 
        sum + zone.prescription.estimatedCost, 0
      );
      
      // Full-field treatment cost (if treating entire field)
      const avgTreatmentCost = 50; // USD per hectare (typical fungicide cost)
      const estimatedCostFullField = fieldArea * avgTreatmentCost;
      
      const savings = estimatedCostFullField - estimatedCostPrecision;
      const savingsPercentage = (savings / estimatedCostFullField) * 100;

      resolve({
        zones,
        summary: {
          totalZones,
          healthyZones,
          warningZones,
          criticalZones,
          treatmentRequired,
          estimatedCostFullField,
          estimatedCostPrecision,
          savings: Math.max(0, savings),
          savingsPercentage: Math.max(0, savingsPercentage),
        },
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(imageFile);
  });
}

// Generate targeted prescription for a specific zone
function generateZonePrescription(
  classification: 'healthy' | 'warning' | 'critical',
  problems: string[],
  detections: DiseaseDetection[],
  zoneArea: number
): Zone['prescription'] {
  if (classification === 'healthy') {
    return {
      action: 'Monitor only',
      product: 'No treatment required',
      rate: 'N/A',
      priority: 'low',
      estimatedCost: 0,
    };
  }

  // Determine treatment based on problems
  let action = '';
  let product = '';
  let rate = '';
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let costPerHa = 0;

  if (classification === 'critical') {
    priority = 'high';
    
    if (detections.length > 0) {
      // Disease detected - fungicide treatment
      action = 'Apply fungicide';
      product = 'Copper oxychloride or Mancozeb';
      rate = '2-3 kg/ha';
      costPerHa = 50; // USD
    } else {
      // Low health but no disease - likely nutrient issue
      action = 'Apply foliar fertilizer';
      product = 'NPK 20-20-20 + micronutrients';
      rate = '5-10 kg/ha';
      costPerHa = 35; // USD
    }
  } else if (classification === 'warning') {
    priority = 'medium';
    action = 'Preventive spray';
    product = 'Biological fungicide or plant tonic';
    rate = '1 L/ha';
    costPerHa = 25; // USD
  }

  return {
    action,
    product,
    rate,
    priority,
    estimatedCost: zoneArea * costPerHa,
  };
}

// Resource optimization calculator
export function calculateResourceOptimization(
  fieldArea: number,
  problemAreaPercentage: number,
  treatmentType: 'fungicide' | 'insecticide' | 'fertilizer' = 'fungicide'
): {
  fullFieldCost: number;
  precisionCost: number;
  savings: number;
  savingsPercentage: number;
  chemicalReduction: number;
  chemicalReductionPercentage: number;
  environmentalImpact: string;
  roi: number;
} {
  // Cost per hectare by treatment type (USD)
  const costPerHa = {
    fungicide: 50,
    insecticide: 45,
    fertilizer: 60,
  };

  const treatmentCost = costPerHa[treatmentType];
  
  // Full field treatment
  const fullFieldCost = fieldArea * treatmentCost;
  
  // Precision treatment (only problem areas)
  const problemArea = fieldArea * (problemAreaPercentage / 100);
  const precisionCost = problemArea * treatmentCost;
  
  // Savings
  const savings = fullFieldCost - precisionCost;
  const savingsPercentage = (savings / fullFieldCost) * 100;
  
  // Chemical reduction
  const fullFieldChemical = fieldArea * 2.5; // kg of active ingredient
  const precisionChemical = problemArea * 2.5;
  const chemicalReduction = fullFieldChemical - precisionChemical;
  const chemicalReductionPercentage = (chemicalReduction / fullFieldChemical) * 100;
  
  // Environmental impact
  let environmentalImpact = '';
  if (chemicalReductionPercentage > 70) {
    environmentalImpact = 'Excellent - Minimal environmental impact, soil health preserved';
  } else if (chemicalReductionPercentage > 50) {
    environmentalImpact = 'Good - Significant reduction in chemical runoff';
  } else if (chemicalReductionPercentage > 30) {
    environmentalImpact = 'Moderate - Reduced chemical exposure to beneficial insects';
  } else {
    environmentalImpact = 'Limited - Some reduction in chemical usage';
  }
  
  // ROI calculation (assuming Talazo service costs $5/ha/scan)
  const serviceCost = fieldArea * 5;
  const roi = ((savings - serviceCost) / serviceCost) * 100;
  
  return {
    fullFieldCost,
    precisionCost,
    savings,
    savingsPercentage,
    chemicalReduction,
    chemicalReductionPercentage,
    environmentalImpact,
    roi,
  };
}

// Generate prescription map data for visualization
export function generatePrescriptionMap(zones: Zone[]): {
  mapData: Array<{
    id: string;
    row: number;
    col: number;
    classification: string;
    color: string;
    action: string;
    priority: string;
  }>;
  legend: { color: string; label: string; count: number }[];
  recommendations: string[];
} {
  const mapData = zones.map(zone => ({
    id: zone.id,
    row: zone.row,
    col: zone.col,
    classification: zone.classification,
    color: 
      zone.classification === 'critical' ? '#ef4444' :
      zone.classification === 'warning' ? '#f59e0b' :
      '#10b981',
    action: zone.prescription.action,
    priority: zone.prescription.priority,
  }));

  const criticalCount = zones.filter(z => z.classification === 'critical').length;
  const warningCount = zones.filter(z => z.classification === 'warning').length;
  const healthyCount = zones.filter(z => z.classification === 'healthy').length;

  const legend = [
    { color: '#ef4444', label: 'Critical - Immediate Action', count: criticalCount },
    { color: '#f59e0b', label: 'Warning - Monitor Closely', count: warningCount },
    { color: '#10b981', label: 'Healthy - No Action', count: healthyCount },
  ];

  const recommendations = [
    `Treat ${criticalCount + warningCount} zones (${((criticalCount + warningCount) / zones.length * 100).toFixed(1)}% of field)`,
    `Monitor ${healthyCount} healthy zones`,
    'Focus resources on problem areas only',
    'Re-scan in 7-10 days to monitor treatment effectiveness',
  ];

  return { mapData, legend, recommendations };
}

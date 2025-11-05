import { CONFIG } from './config';
import { AnalysisResult } from './store';
import { generateAnalysisFromImage } from './mockData';
import { analyzeWithHuggingFace, mapDiseaseInfo } from './huggingfaceService';
import { analyzeImageAdvanced } from './advancedImageAnalysis';

// Simple hash function for seeding consistent random values
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

// Roboflow API response types
interface RoboflowPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  detection_id: string;
}

interface RoboflowResponse {
  time: number;
  image: {
    width: number;
    height: number;
  };
  predictions: RoboflowPrediction[];
}

// Disease severity mapping based on confidence and affected area
function calculateSeverity(confidence: number, affectedArea: number): string {
  if (confidence < 0.5 || affectedArea < 10) return 'low';
  if (confidence < 0.75 || affectedArea < 30) return 'medium';
  return 'high';
}

// Generate recommendations based on detected disease
function generateRecommendations(diseaseType: string, severity: string): string[] {
  const recommendations: string[] = [];
  
  // Generic recommendations based on severity
  if (severity === 'high') {
    recommendations.push('🚨 Immediate action required - disease spreading rapidly');
    recommendations.push('Isolate affected plants to prevent spread');
    recommendations.push('Consult agricultural extension officer');
  } else if (severity === 'medium') {
    recommendations.push('⚠️ Monitor closely and take preventive action');
    recommendations.push('Apply treatment within 48 hours');
  } else {
    recommendations.push('✓ Early detection - preventive treatment recommended');
  }
  
  // Disease-specific recommendations (customize based on your model's classes)
  const diseaseLC = diseaseType.toLowerCase();
  
  if (diseaseLC.includes('blight') || diseaseLC.includes('spot')) {
    recommendations.push('Apply copper-based fungicide');
    recommendations.push('Remove infected leaves and dispose properly');
    recommendations.push('Improve air circulation around plants');
  }
  
  if (diseaseLC.includes('mosaic') || diseaseLC.includes('virus')) {
    recommendations.push('Remove and destroy infected plants immediately');
    recommendations.push('Control aphid vectors with appropriate insecticide');
    recommendations.push('Use virus-resistant varieties for replanting');
  }
  
  if (diseaseLC.includes('wilt')) {
    recommendations.push('Reduce irrigation to prevent waterlogging');
    recommendations.push('Apply fungicide treatment to soil');
    recommendations.push('Ensure proper drainage in field');
  }
  
  if (diseaseLC.includes('rust')) {
    recommendations.push('Apply sulfur or triazole fungicide');
    recommendations.push('Remove heavily infected leaves');
    recommendations.push('Plant resistant varieties next season');
  }
  
  // General prevention
  recommendations.push('📋 Monitor field daily for disease progression');
  recommendations.push('Keep detailed records for future reference');
  
  return recommendations;
}

// Analyze image with ML (Hugging Face + Advanced Image Analysis)
export async function analyzeImageWithML(
  imageFile: File,
  cropType: string = 'tobacco',
  isAerial: boolean = false
): Promise<Partial<AnalysisResult>> {
  
  // Use REAL ML approaches
  if (CONFIG.USE_REAL_ML) {
    // NOTE: Groq Vision deprecated (llama-3.2-vision models decommissioned Nov 2024)
    // Skipping directly to Hugging Face

    // Try Method 1: Hugging Face Plant Disease Model
    try {
      console.log('🤖 Attempting Hugging Face Plant Disease Model...');
      
      const result = await analyzeWithHuggingFace(imageFile);
      const diseaseInfo = mapDiseaseInfo(result.disease);
      
      // Calculate severity based on confidence
      const severity = result.confidence > 0.8 ? 'high' : 
                      result.confidence > 0.6 ? 'medium' : 'low';
      
      // Estimate affected area based on confidence and disease type
      const affectedArea = Math.round(result.confidence * 45) + 10; // 10-55%
      
      console.log(`✅ HF Success: ${diseaseInfo.name} (${Math.round(result.confidence * 100)}% confidence)`);
      console.log(`📊 Other predictions:`, result.allPredictions.slice(1, 4).map(p => `${p.label} (${Math.round(p.score * 100)}%)`));
      
      const timestamp = Date.now().toString();
      
      return {
        disease: {
          detected: !result.disease.toLowerCase().includes('healthy'),
          type: diseaseInfo.name,
          confidence: Math.round(result.confidence * 100),
          affectedArea: affectedArea,
          severity: severity,
          recommendations: diseaseInfo.recommendations,
        },
        nutrient: generateMockNutrientData(timestamp),
        water: generateMockWaterData(timestamp),
        ndvi: generateMockNDVIData(timestamp),
      };
      
    } catch (hfError) {
      // Silently use offline analysis (expected behavior)
      console.log('💡 Hugging Face unavailable, using offline analysis...');
      
      // Method 2: Advanced client-side image analysis (works offline)
      try {
        console.log('🔬 Analyzing image (color/texture detection)...');
        
        const analysis = await analyzeImageAdvanced(imageFile);
        
        console.log(`✅ Image Analysis: ${analysis.disease} (${analysis.confidence}% confidence)`);
        console.log(`📊 Affected area: ${analysis.affectedArea}%, Severity: ${analysis.severity}`);
        
        const timestamp = Date.now().toString();
        
        return {
          disease: {
            detected: analysis.disease !== 'Healthy Plant',
            type: analysis.disease,
            confidence: analysis.confidence,
            affectedArea: analysis.affectedArea,
            severity: analysis.severity,
            recommendations: analysis.recommendations,
          },
          nutrient: generateMockNutrientData(timestamp),
          water: generateMockWaterData(timestamp),
          ndvi: generateMockNDVIData(timestamp),
        };
        
      } catch (analysisError) {
        console.error('❌ Advanced analysis failed:', analysisError);
        console.warn('⚠️ Falling back to demo data');
      }
    }
  } else {
    console.log('📋 Demo mode active (NEXT_PUBLIC_USE_REAL_ML=false)');
  }

  // Final fallback: Generate mock data
  return generateAnalysisFromImage(imageFile);
}

// Analyze disease detection with Roboflow
async function analyzeDiseaseDetection(
  imageFile: File,
  cropType: string,
  isAerial: boolean
): Promise<Partial<AnalysisResult>> {
  try {
    // Select appropriate model based on crop type and image type
    const modelId = selectDiseaseModel(cropType, isAerial);
    
    console.log(`🔍 Analyzing with model: ${modelId} for ${cropType}`);
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call Roboflow API
    const url = `${CONFIG.ROBOFLOW_API_URL}/${modelId}?api_key=${CONFIG.ROBOFLOW_API_KEY}&confidence=40`;
    
    console.log(`📡 Calling Roboflow API...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Image,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Roboflow API error: ${response.status}`, errorText);
      
      // Provide helpful error message
      if (response.status === 403) {
        console.warn('⚠️ Model access denied. Using mock data. Please verify Roboflow API key and model access.');
      }
      
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const data: RoboflowResponse = await response.json();
    
    console.log(`✅ Roboflow response:`, data);
    console.log(`📊 Predictions found: ${data.predictions?.length || 0}`);
    
    // Process predictions
    return processRoboflowResponse(data, imageFile);
  } catch (error) {
    console.error('🚨 ML Analysis error:', error);
    // Fallback to mock data with warning
    console.warn('⚠️ Falling back to mock data due to API error');
    return generateAnalysisFromImage(imageFile);
  }
}

// Select appropriate disease model based on crop type and image perspective
function selectDiseaseModel(cropType: string, isAerial: boolean): string {
  const models = CONFIG.ROBOFLOW_MODELS;
  
  if (isAerial) {
    // For aerial images, use specialized aerial models
    return models.aerial_health;
  }
  
  // Map crop types to models (8 priority crops)
  const cropLower = cropType.toLowerCase();
  
  if (cropLower.includes('tobacco')) return models.tobacco;
  if (cropLower.includes('maize') || cropLower.includes('corn')) return models.maize;
  if (cropLower.includes('tomato')) return models.tomato;
  if (cropLower.includes('potato')) return models.potato;
  if (cropLower.includes('wheat')) return models.wheat;
  if (cropLower.includes('watermelon') || cropLower.includes('melon')) return models.watermelon;
  if (cropLower.includes('blueberry') || cropLower.includes('berry')) return models.blueberry;
  if (cropLower.includes('cotton')) return models.cotton;
  
  // Default to tobacco model
  return models.tobacco;
}

// Select appropriate nutrient model based on crop type
function selectNutrientModel(cropType: string): string {
  const models = CONFIG.ROBOFLOW_NUTRIENT_MODELS;
  
  // Map crop types to specific nutrient models
  const cropLower = cropType.toLowerCase();
  
  if (cropLower.includes('tomato')) return models.tomato;
  if (cropLower.includes('maize') || cropLower.includes('corn')) return models.maize;
  if (cropLower.includes('potato')) return models.potato;
  
  // Default to general nutrient model for other crops
  return models.general;
}

// Analyze nutrient deficiency with Roboflow
async function analyzeNutrientDeficiency(
  imageFile: File,
  cropType: string
): Promise<Partial<AnalysisResult>> {
  try {
    // Select appropriate nutrient model
    const modelId = selectNutrientModel(cropType);
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call Roboflow API
    const url = `${CONFIG.ROBOFLOW_API_URL}/${modelId}?api_key=${CONFIG.ROBOFLOW_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: base64Image,
    });

    if (!response.ok) {
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const data: RoboflowResponse = await response.json();
    
    // Process nutrient predictions
    return processNutrientResponse(data);
  } catch (error) {
    console.error('Nutrient analysis error:', error);
    // Fallback to mock data with timestamp seed
    const timestamp = Date.now().toString();
    return { nutrient: generateMockNutrientData(timestamp) };
  }
}

// Process nutrient deficiency predictions
function processNutrientResponse(response: RoboflowResponse): Partial<AnalysisResult> {
  const predictions = response.predictions || [];
  
  // Default nutrient values (healthy crop)
  let nitrogen = 75;
  let phosphorus = 70;
  let potassium = 72;
  let primaryDeficiency = 'None';
  const confidence = predictions.length > 0 ? Math.round(predictions[0].confidence * 100) : 85;
  
  if (predictions.length > 0) {
    // Map Roboflow class names to nutrient deficiencies
    const detectedClass = predictions[0].class.toLowerCase();
    
    if (detectedClass.includes('nitrogen') || detectedClass.includes('n-deficiency')) {
      nitrogen = 35;
      primaryDeficiency = 'Nitrogen (N)';
    } else if (detectedClass.includes('phosphorus') || detectedClass.includes('p-deficiency')) {
      phosphorus = 30;
      primaryDeficiency = 'Phosphorus (P)';
    } else if (detectedClass.includes('potassium') || detectedClass.includes('k-deficiency')) {
      potassium = 28;
      primaryDeficiency = 'Potassium (K)';
    } else if (detectedClass.includes('iron') || detectedClass.includes('fe-deficiency')) {
      primaryDeficiency = 'Iron (Fe)';
      nitrogen = 60; // Iron deficiency often shows as chlorosis
    } else if (detectedClass.includes('magnesium') || detectedClass.includes('mg-deficiency')) {
      primaryDeficiency = 'Magnesium (Mg)';
      nitrogen = 55;
    }
  }
  
  // Generate recommendations based on deficiency
  const recommendations = generateNutrientRecommendations(primaryDeficiency, nitrogen, phosphorus, potassium);
  
  return {
    nutrient: {
      nitrogen,
      phosphorus,
      potassium,
      primaryDeficiency,
      confidence,
      recommendations,
    },
  };
}

// Generate nutrient-specific recommendations
function generateNutrientRecommendations(
  deficiency: string,
  n: number,
  p: number,
  k: number
): string[] {
  const recommendations: string[] = [];
  
  if (deficiency === 'None') {
    recommendations.push('✅ Nutrient levels appear adequate');
    recommendations.push('Continue balanced fertilization program');
    recommendations.push('Monitor regularly to maintain optimal levels');
    return recommendations;
  }
  
  // Nitrogen deficiency
  if (deficiency.includes('Nitrogen') || n < 50) {
    recommendations.push('🚨 Apply nitrogen-rich fertilizer immediately');
    recommendations.push('Use urea (46-0-0) or ammonium nitrate (34-0-0) at recommended rate');
    recommendations.push('Apply foliar spray with urea for quick response');
    recommendations.push('Consider side-dressing with nitrogen in 2-3 weeks');
  }
  
  // Phosphorus deficiency
  if (deficiency.includes('Phosphorus') || p < 50) {
    recommendations.push('🚨 Apply phosphorus fertilizer (superphosphate or DAP)');
    recommendations.push('Use 18-46-0 (DAP) at 150-200 kg/hectare');
    recommendations.push('Apply to root zone for better uptake');
    recommendations.push('Check soil pH - phosphorus availability reduced in alkaline soils');
  }
  
  // Potassium deficiency
  if (deficiency.includes('Potassium') || k < 50) {
    recommendations.push('🚨 Apply potassium fertilizer (muriate of potash)');
    recommendations.push('Use KCl (0-0-60) at 100-150 kg/hectare');
    recommendations.push('Split application over 2-3 weeks for better results');
    recommendations.push('Ensure adequate soil moisture for nutrient uptake');
  }
  
  // Micronutrient deficiencies
  if (deficiency.includes('Iron')) {
    recommendations.push('Apply iron chelate (Fe-EDTA) as foliar spray');
    recommendations.push('Check soil pH - iron deficiency common in alkaline soils');
    recommendations.push('Apply sulfur to lower soil pH if needed');
  }
  
  if (deficiency.includes('Magnesium')) {
    recommendations.push('Apply Epsom salt (magnesium sulfate) as foliar spray');
    recommendations.push('Use dolomitic limestone for long-term correction');
    recommendations.push('Avoid excessive potassium which can induce Mg deficiency');
  }
  
  // General advice
  recommendations.push('📋 Conduct soil test to confirm nutrient levels');
  recommendations.push('Re-scan in 10-14 days to monitor improvement');
  recommendations.push('Keep records of fertilizer applications');
  
  return recommendations;
}

// Process Roboflow disease response into our analysis format
function processRoboflowResponse(
  response: RoboflowResponse,
  imageFile: File
): Partial<AnalysisResult> {
  const predictions = response.predictions || [];
  
  // Use file size + name as seed for consistent mock data
  const seed = `${imageFile.name}-${imageFile.size}`;
  
  // Check if any disease detected
  const diseaseDetected = predictions.length > 0;
  
  if (!diseaseDetected) {
    // No disease detected - healthy crop
    return {
      disease: {
        detected: false,
        type: 'None',
        confidence: 95,
        affectedArea: 0,
        severity: 'none',
        recommendations: [
          '✅ Crop appears healthy',
          'Continue regular monitoring',
          'Maintain current care practices',
          'Schedule next scan in 7 days',
        ],
      },
      nutrient: generateMockNutrientData(seed),
      water: generateMockWaterData(seed),
      ndvi: generateMockNDVIData(seed),
    };
  }
  
  // Get the prediction with highest confidence
  const topPrediction = predictions.reduce((prev, current) => 
    (prev.confidence > current.confidence) ? prev : current
  );
  
  // Calculate affected area (rough estimate based on bounding box)
  const imageArea = response.image.width * response.image.height;
  const totalAffectedArea = predictions.reduce((sum, pred) => {
    return sum + (pred.width * pred.height);
  }, 0);
  const affectedPercentage = Math.min(100, Math.round((totalAffectedArea / imageArea) * 100));
  
  // Calculate average confidence
  const avgConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length;
  const confidencePercent = Math.round(avgConfidence * 100);
  
  // Determine severity
  const severity = calculateSeverity(avgConfidence, affectedPercentage);
  
  // Generate recommendations
  const recommendations = generateRecommendations(topPrediction.class, severity);
  
  return {
    disease: {
      detected: true,
      type: topPrediction.class,
      confidence: confidencePercent,
      affectedArea: affectedPercentage,
      severity: severity,
      recommendations: recommendations,
    },
    nutrient: generateMockNutrientData(seed),
    water: generateMockWaterData(seed),
    ndvi: generateMockNDVIData(seed),
  };
}

// Helper: Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Mock data generators (for nutrient and water analysis)
function generateMockNutrientData(seed?: string) {
  // Use seed for consistent results if provided
  const hash = seed ? hashString(seed) : Math.random();
  const seededRandom = (offset: number) => ((hash + offset) % 1);
  
  return {
    nitrogen: Math.round(seededRandom(0.1) * 30 + 60),
    phosphorus: Math.round(seededRandom(0.2) * 30 + 60),
    potassium: Math.round(seededRandom(0.3) * 30 + 60),
    primaryDeficiency: seededRandom(0.4) > 0.7 ? 'Nitrogen' : 'None',
    confidence: Math.round(seededRandom(0.5) * 15 + 75),
    recommendations: [
      'Soil test recommended for accurate nutrient levels',
      'Consider foliar feeding if deficiency confirmed',
      'Monitor leaf color for changes',
    ],
  };
}

function generateMockWaterData(seed?: string) {
  const hash = seed ? hashString(seed) : Math.random();
  const seededRandom = (offset: number) => ((hash + offset) % 1);
  
  const moisture = Math.round(seededRandom(0.1) * 30 + 50);
  return {
    status: moisture < 40 ? 'Low' : moisture > 75 ? 'High' : 'Optimal',
    soilMoisture: moisture,
    confidence: Math.round(seededRandom(0.2) * 15 + 75),
    recommendations: [
      moisture < 40 ? 'Increase irrigation frequency' : 'Maintain current irrigation schedule',
      'Check soil drainage',
      'Monitor weather forecast',
    ],
  };
}

function generateMockNDVIData(seed?: string) {
  const hash = seed ? hashString(seed) : Math.random();
  const seededRandom = (offset: number) => ((hash + offset) % 1);
  
  const currentValue = Math.round(seededRandom(0.1) * 20 + 70) / 100;
  const trend = seededRandom(0.2) > 0.5 ? 'improving' : 'declining';
  
  // Generate 10 weeks of historical data
  const historicalData = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 70); // 10 weeks ago
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i * 7); // Weekly intervals
    
    // Generate trending values
    let baseValue = trend === 'improving' ? 0.65 + (i * 0.03) : 0.85 - (i * 0.03);
    baseValue += (seededRandom(0.3 + i * 0.01) - 0.5) * 0.05; // Add some randomness
    baseValue = Math.max(0.4, Math.min(0.95, baseValue)); // Clamp between 0.4 and 0.95
    
    historicalData.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue * 100) / 100,
    });
  }
  
  return {
    average: currentValue,
    healthy: Math.round(Math.random() * 15 + 75),
    stressed: Math.round(Math.random() * 15 + 10),
    trend: trend as 'improving' | 'declining',
    historicalData: historicalData,
  };
}

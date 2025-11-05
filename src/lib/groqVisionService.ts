/**
 * Groq Vision API for plant disease detection
 * NOTE: Groq has decommissioned their vision models as of November 2024
 * This service is kept for future compatibility if vision models return
 */

interface GroqVisionResponse {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  affectedArea: number;
  recommendations: string[];
}

/**
 * Analyze plant disease using Groq Vision API
 * NOTE: Groq's vision models have been decommissioned
 * This function throws to trigger fallback to Hugging Face or offline analysis
 */
export async function analyzeWithGroqVision(_imageFile: File): Promise<GroqVisionResponse> {
  // Groq vision models (llama-3.2-90b/11b-vision-preview) deprecated
  // Skip to working fallbacks immediately
  throw new Error('Groq Vision models decommissioned. Using fallback methods.');
}

/**
 * Map disease to treatment recommendations
 */
export function enhanceGroqRecommendations(disease: string, recommendations: string[]): string[] {
  const enhanced = [...recommendations];
  
  // Add crop-specific context if needed
  if (disease.toLowerCase().includes('blight')) {
    enhanced.push('Monitor weather - blight spreads in wet conditions');
  }
  
  if (disease.toLowerCase().includes('virus')) {
    enhanced.push('Control aphids and other insect vectors');
  }
  
  enhanced.push('📋 Keep records for agricultural extension officer');
  
  return enhanced;
}

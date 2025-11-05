// Hugging Face models for plant disease detection
// Now using Next.js API route to bypass CORS

interface HuggingFaceResult {
  label: string;
  score: number;
}

/**
 * Analyze plant disease using Hugging Face's free models via Next.js API route
 * This bypasses CORS issues by making the API call server-side
 */
export async function analyzeWithHuggingFace(imageFile: File): Promise<{
  disease: string;
  confidence: number;
  allPredictions: HuggingFaceResult[];
}> {
  try {
    console.log('🔍 Analyzing with Hugging Face Plant Disease Model...');
    console.log('📊 Image details:', { 
      name: imageFile.name, 
      size: imageFile.size, 
      type: imageFile.type 
    });
    
    // Create FormData to send to our Next.js API route
    const formData = new FormData();
    formData.append('image', imageFile);
    
    console.log('📡 Calling Next.js API route (server-side Hugging Face)...');
    
    // Call our Next.js API route instead of Hugging Face directly
    const response = await fetch('/api/analyze-disease', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle model loading state (503)
      if (response.status === 503 && errorData.retry) {
        console.warn('⏳ Model is loading, will retry automatically...');
        throw new Error('MODEL_LOADING');
      }
      
      // Handle model unavailable (410 Gone or 404)
      if (response.status === 410 || response.status === 404) {
        console.warn('⚠️ Hugging Face model unavailable (status:', response.status, ')');
        throw new Error('MODEL_UNAVAILABLE');
      }
      
      console.warn('⚠️ API route error:', response.status, errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Server-side analysis results:', result);

    if (!result.success || !result.disease) {
      throw new Error('Invalid response from server');
    }

    return {
      disease: result.disease,
      confidence: result.confidence,
      allPredictions: result.allPredictions || []
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Silent fallback - don't clutter console with expected failures
    if (errorMessage === 'MODEL_LOADING' || errorMessage === 'MODEL_UNAVAILABLE' || errorMessage === 'All models unavailable') {
      console.log('💡 Using offline analysis (online models unavailable)');
    } else {
      console.warn('⚠️ Hugging Face error:', errorMessage);
    }
    
    throw error;
  }
}

/**
 * Map Hugging Face disease labels to user-friendly names and recommendations
 */
export function mapDiseaseInfo(label: string): {
  name: string;
  type: string;
  recommendations: string[];
} {
  const labelLower = label.toLowerCase();

  // Common plant diseases mapping
  const diseaseMap: Record<string, { name: string; type: string; recommendations: string[] }> = {
    'healthy': {
      name: 'Healthy Plant',
      type: 'No Disease Detected',
      recommendations: [
        '✓ Plant appears healthy',
        'Continue regular monitoring',
        'Maintain current care practices'
      ]
    },
    'early blight': {
      name: 'Early Blight',
      type: 'Fungal Disease',
      recommendations: [
        'Apply copper-based fungicide',
        'Remove infected leaves immediately',
        'Improve air circulation around plants',
        'Water at base to keep foliage dry'
      ]
    },
    'late blight': {
      name: 'Late Blight',
      type: 'Fungal Disease',
      recommendations: [
        '🚨 Immediate action required',
        'Apply systemic fungicide (Ridomil, Metalaxyl)',
        'Remove and destroy severely infected plants',
        'Avoid overhead irrigation',
        'Monitor closely in humid conditions'
      ]
    },
    'bacterial spot': {
      name: 'Bacterial Spot',
      type: 'Bacterial Disease',
      recommendations: [
        'Apply copper-based bactericide',
        'Remove infected plant parts',
        'Avoid working with plants when wet',
        'Use disease-free seeds'
      ]
    },
    'septoria': {
      name: 'Septoria Leaf Spot',
      type: 'Fungal Disease',
      recommendations: [
        'Apply chlorothalonil or copper fungicide',
        'Remove lower leaves touching soil',
        'Mulch around plants',
        'Rotate crops annually'
      ]
    },
    'mosaic': {
      name: 'Mosaic Virus',
      type: 'Viral Disease',
      recommendations: [
        'Remove and destroy infected plants',
        'Control aphid vectors',
        'Use virus-resistant varieties',
        'Disinfect tools between plants'
      ]
    },
    'leaf mold': {
      name: 'Leaf Mold',
      type: 'Fungal Disease',
      recommendations: [
        'Increase ventilation',
        'Reduce humidity',
        'Apply fungicide if severe',
        'Remove affected leaves'
      ]
    },
    'spider mites': {
      name: 'Spider Mite Damage',
      type: 'Pest Damage',
      recommendations: [
        'Spray with water to dislodge mites',
        'Apply neem oil or insecticidal soap',
        'Increase humidity',
        'Use miticides if severe'
      ]
    },
    'target spot': {
      name: 'Target Spot',
      type: 'Fungal Disease',
      recommendations: [
        'Apply fungicide (azoxystrobin)',
        'Improve drainage',
        'Reduce leaf wetness',
        'Remove infected tissue'
      ]
    },
    'leaf curl': {
      name: 'Leaf Curl Virus',
      type: 'Viral Disease',
      recommendations: [
        'Control whitefly vectors',
        'Use yellow sticky traps',
        'Remove severely infected plants',
        'Plant resistant varieties'
      ]
    },
    'powdery mildew': {
      name: 'Powdery Mildew',
      type: 'Fungal Disease',
      recommendations: [
        'Apply sulfur or potassium bicarbonate',
        'Improve air circulation',
        'Avoid overhead watering',
        'Prune dense foliage'
      ]
    }
  };

  // Find matching disease
  for (const [key, value] of Object.entries(diseaseMap)) {
    if (labelLower.includes(key)) {
      return value;
    }
  }

  // Default for unknown diseases
  return {
    name: label,
    type: 'Disease Detected',
    recommendations: [
      'Consult agricultural extension officer',
      'Take additional photos for confirmation',
      'Monitor plant closely',
      'Isolate from healthy plants if possible'
    ]
  };
}

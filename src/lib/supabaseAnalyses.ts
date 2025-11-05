import { supabase } from './supabase';
import { AnalysisResult } from './store';

// Fetch all analyses for current user
export async function fetchAnalyses(userId: string): Promise<AnalysisResult[]> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching analyses:', error);
      return [];
    }

    // Transform database format to app format
    return (data || []).map((analysis) => ({
      id: analysis.id,
      fieldId: analysis.field_id,
      timestamp: analysis.timestamp,
      imageUrl: analysis.image_url || undefined,
      disease: {
        detected: analysis.disease_detected,
        type: analysis.disease_type || '',
        confidence: parseFloat(analysis.disease_confidence) || 0,
        affectedArea: parseFloat(analysis.disease_affected_area) || 0,
        severity: analysis.disease_severity || '',
        recommendations: analysis.disease_recommendations || [],
      },
      nutrient: {
        nitrogen: parseFloat(analysis.nutrient_nitrogen) || 0,
        phosphorus: parseFloat(analysis.nutrient_phosphorus) || 0,
        potassium: parseFloat(analysis.nutrient_potassium) || 0,
        primaryDeficiency: analysis.nutrient_deficiency || '',
        confidence: parseFloat(analysis.nutrient_confidence) || 0,
        recommendations: analysis.nutrient_recommendations || [],
      },
      water: {
        status: analysis.water_status || '',
        soilMoisture: parseFloat(analysis.water_soil_moisture) || 0,
        confidence: parseFloat(analysis.water_confidence) || 0,
        recommendations: analysis.water_recommendations || [],
      },
      ndvi: {
        average: 0.75, // Mock NDVI data for now
        healthy: 85,
        stressed: 15,
        trend: 'stable',
        historicalData: [],
      },
    }));
  } catch (error) {
    console.error('Error in fetchAnalyses:', error);
    return [];
  }
}

// Fetch analyses for a specific field
export async function fetchFieldAnalyses(fieldId: string): Promise<AnalysisResult[]> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('field_id', fieldId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching field analyses:', error);
      return [];
    }

    return (data || []).map((analysis) => ({
      id: analysis.id,
      fieldId: analysis.field_id,
      timestamp: analysis.timestamp,
      imageUrl: analysis.image_url || undefined,
      disease: {
        detected: analysis.disease_detected,
        type: analysis.disease_type || '',
        confidence: parseFloat(analysis.disease_confidence) || 0,
        affectedArea: parseFloat(analysis.disease_affected_area) || 0,
        severity: analysis.disease_severity || '',
        recommendations: analysis.disease_recommendations || [],
      },
      nutrient: {
        nitrogen: parseFloat(analysis.nutrient_nitrogen) || 0,
        phosphorus: parseFloat(analysis.nutrient_phosphorus) || 0,
        potassium: parseFloat(analysis.nutrient_potassium) || 0,
        primaryDeficiency: analysis.nutrient_deficiency || '',
        confidence: parseFloat(analysis.nutrient_confidence) || 0,
        recommendations: analysis.nutrient_recommendations || [],
      },
      water: {
        status: analysis.water_status || '',
        soilMoisture: parseFloat(analysis.water_soil_moisture) || 0,
        confidence: parseFloat(analysis.water_confidence) || 0,
        recommendations: analysis.water_recommendations || [],
      },
      ndvi: {
        average: 0.75,
        healthy: 85,
        stressed: 15,
        trend: 'stable',
        historicalData: [],
      },
    }));
  } catch (error) {
    console.error('Error in fetchFieldAnalyses:', error);
    return [];
  }
}

// Add a new analysis
export async function addAnalysisToSupabase(
  userId: string,
  analysis: Omit<AnalysisResult, 'id' | 'timestamp'>
): Promise<AnalysisResult | null> {
  try {
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: userId,
        field_id: analysis.fieldId,
        image_url: analysis.imageUrl || null,
        disease_detected: analysis.disease.detected,
        disease_type: analysis.disease.type,
        disease_confidence: analysis.disease.confidence,
        disease_affected_area: analysis.disease.affectedArea,
        disease_severity: analysis.disease.severity,
        disease_recommendations: analysis.disease.recommendations,
        nutrient_nitrogen: analysis.nutrient.nitrogen,
        nutrient_phosphorus: analysis.nutrient.phosphorus,
        nutrient_potassium: analysis.nutrient.potassium,
        nutrient_deficiency: analysis.nutrient.primaryDeficiency,
        nutrient_confidence: analysis.nutrient.confidence,
        nutrient_recommendations: analysis.nutrient.recommendations,
        water_status: analysis.water.status,
        water_soil_moisture: analysis.water.soilMoisture,
        water_confidence: analysis.water.confidence,
        water_recommendations: analysis.water.recommendations,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding analysis:', error);
      return null;
    }

    // Transform back to app format
    return {
      id: data.id,
      fieldId: data.field_id,
      timestamp: data.timestamp,
      imageUrl: data.image_url || undefined,
      disease: {
        detected: data.disease_detected,
        type: data.disease_type || '',
        confidence: parseFloat(data.disease_confidence) || 0,
        affectedArea: parseFloat(data.disease_affected_area) || 0,
        severity: data.disease_severity || '',
        recommendations: data.disease_recommendations || [],
      },
      nutrient: {
        nitrogen: parseFloat(data.nutrient_nitrogen) || 0,
        phosphorus: parseFloat(data.nutrient_phosphorus) || 0,
        potassium: parseFloat(data.nutrient_potassium) || 0,
        primaryDeficiency: data.nutrient_deficiency || '',
        confidence: parseFloat(data.nutrient_confidence) || 0,
        recommendations: data.nutrient_recommendations || [],
      },
      water: {
        status: data.water_status || '',
        soilMoisture: parseFloat(data.water_soil_moisture) || 0,
        confidence: parseFloat(data.water_confidence) || 0,
        recommendations: data.water_recommendations || [],
      },
      ndvi: analysis.ndvi,
    };
  } catch (error) {
    console.error('Error in addAnalysisToSupabase:', error);
    return null;
  }
}

// Delete an analysis
export async function deleteAnalysisFromSupabase(analysisId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', analysisId);

    if (error) {
      console.error('Error deleting analysis:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAnalysisFromSupabase:', error);
    return false;
  }
}

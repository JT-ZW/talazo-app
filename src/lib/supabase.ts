import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DbUser {
  id: string;
  email: string;
  name: string;
  farm_name?: string;
  location?: string;
  subscription_tier?: 'free' | 'basic' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface DbField {
  id: string;
  user_id: string;
  name: string;
  crop_type: string;
  area: number;
  planting_date: string;
  coordinates: number[][][]; // GeoJSON polygon
  last_scan?: string;
  health_status?: 'healthy' | 'warning' | 'critical';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DbAnalysis {
  id: string;
  user_id: string;
  field_id: string;
  timestamp: string;
  image_url?: string;
  disease_detected: boolean;
  disease_type: string;
  disease_confidence: number;
  disease_affected_area: number;
  disease_severity: string;
  disease_recommendations: string[];
  nutrient_nitrogen: number;
  nutrient_phosphorus: number;
  nutrient_potassium: number;
  nutrient_deficiency: string;
  nutrient_confidence: number;
  nutrient_recommendations: string[];
  water_status: string;
  water_soil_moisture: number;
  water_confidence: number;
  water_recommendations: string[];
  created_at: string;
}

// Helper functions
export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured');
    return false;
  }

  try {
    const { error } = await supabase.from('users').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

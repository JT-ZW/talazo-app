import { supabase } from './supabase';
import { Field } from './store';

// Fetch all fields for current user
export async function fetchFields(userId: string): Promise<Field[]> {
  try {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching fields:', error);
      return [];
    }

    // Transform database format to app format
    return (data || []).map((field) => ({
      id: field.id,
      name: field.name,
      cropType: field.crop_type,
      area: parseFloat(field.area),
      plantingDate: field.planting_date,
      coordinates: field.coordinates,
      lastScan: field.last_scan || undefined,
      healthStatus: field.health_status as 'healthy' | 'warning' | 'critical' | undefined,
      notes: field.notes || undefined,
    }));
  } catch (error) {
    console.error('Error in fetchFields:', error);
    return [];
  }
}

// Add a new field
export async function addFieldToSupabase(userId: string, field: Omit<Field, 'id'>): Promise<Field | null> {
  try {
    console.log('📡 Attempting to add field to Supabase:', { userId, fieldName: field.name });
    
    const { data, error } = await supabase
      .from('fields')
      .insert({
        user_id: userId,
        name: field.name,
        crop_type: field.cropType,
        area: field.area,
        planting_date: field.plantingDate,
        coordinates: field.coordinates,
        last_scan: field.lastScan || null,
        health_status: field.healthStatus || null,
        notes: field.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error adding field:', error);
      throw new Error(`Failed to save field: ${error.message}`);
    }

    console.log('✅ Field added to Supabase:', data);

    // Transform back to app format
    return {
      id: data.id,
      name: data.name,
      cropType: data.crop_type,
      area: parseFloat(data.area),
      plantingDate: data.planting_date,
      coordinates: data.coordinates,
      lastScan: data.last_scan || undefined,
      healthStatus: data.health_status as 'healthy' | 'warning' | 'critical' | undefined,
      notes: data.notes || undefined,
    };
  } catch (error) {
    console.error('❌ Error in addFieldToSupabase:', error);
    throw error;
  }
}

// Update an existing field
export async function updateFieldInSupabase(
  fieldId: string,
  updates: Partial<Omit<Field, 'id'>>
): Promise<boolean> {
  try {
    const dbUpdates: Record<string, unknown> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.cropType !== undefined) dbUpdates.crop_type = updates.cropType;
    if (updates.area !== undefined) dbUpdates.area = updates.area;
    if (updates.plantingDate !== undefined) dbUpdates.planting_date = updates.plantingDate;
    if (updates.coordinates !== undefined) dbUpdates.coordinates = updates.coordinates;
    if (updates.lastScan !== undefined) dbUpdates.last_scan = updates.lastScan;
    if (updates.healthStatus !== undefined) dbUpdates.health_status = updates.healthStatus;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase
      .from('fields')
      .update(dbUpdates)
      .eq('id', fieldId);

    if (error) {
      console.error('Error updating field:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateFieldInSupabase:', error);
    return false;
  }
}

// Delete a field
export async function deleteFieldFromSupabase(fieldId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', fieldId);

    if (error) {
      console.error('Error deleting field:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFieldFromSupabase:', error);
    return false;
  }
}

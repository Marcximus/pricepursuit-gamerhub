
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";
import { CollectionStats } from "./types.ts";
import { supabase } from "./supabaseClient.ts";

const PROGRESS_ID = '7c75e6fe-c6b3-40be-9378-e44c8f45787d';

/**
 * Save the progress of the collection process
 * @param groupIndex Current group index
 * @param brandIndex Current brand index
 * @param stats Collection statistics
 * @param isComplete Whether the collection is complete
 */
export async function saveProgress(
  groupIndex: number, 
  brandIndex: number, 
  stats: CollectionStats, 
  isComplete = false
): Promise<void> {
  const progressData = isComplete ? null : {
    groupIndex,
    brandIndex,
    timestamp: new Date().toISOString(),
    stats
  };

  try {
    const { error } = await supabase
      .from('collection_progress')
      .upsert({
        id: PROGRESS_ID,
        progress_data: progressData,
        last_updated: new Date().toISOString(),
        progress_type: 'laptop_collection'
      });

    if (error) {
      console.error('Error saving collection progress:', error);
    }
  } catch (err) {
    console.error('Exception saving collection progress:', err);
  }
}

/**
 * Update the status of a brand in the database
 * @param brand Brand name
 * @param status New status ('in_progress', 'completed', or 'pending')
 */
export async function updateBrandStatus(brand: string, status: 'in_progress' | 'completed' | 'pending'): Promise<void> {
  const updateData = {
    collection_status: status,
    ...(status === 'in_progress' ? { last_collection_attempt: new Date().toISOString() } : {})
  };

  const { error } = await supabase
    .from('products')
    .update(updateData)
    .eq('brand', brand);

  if (error) {
    console.error(`Error updating brand status for ${brand}:`, error);
    throw error;
  }
}

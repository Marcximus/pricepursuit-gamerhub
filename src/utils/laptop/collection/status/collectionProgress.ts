
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { CollectionStats } from "../../types";

/**
 * Save the current progress of collection to the database
 * @param groupIndex Current group index
 * @param brandIndex Current brand index
 * @param stats Current collection statistics
 * @param isComplete Whether collection is complete
 */
export async function saveCollectionProgress(
  groupIndex: number, 
  brandIndex: number, 
  stats: CollectionStats,
  isComplete: boolean = false
) {
  try {
    // Create the progress data object (or null if collection is complete)
    // Using type assertion to ensure compatibility with Json type
    const progressData = isComplete ? null : {
      groupIndex,
      brandIndex,
      timestamp: new Date().toISOString(),
      stats: {
        processed: stats.processed,
        updated: stats.updated,
        added: stats.added,
        failed: stats.failed,
        skipped: stats.skipped
      }
    } as Json;
    
    // Use a fixed UUID for the ID field
    const progressId = '7c75e6fe-c6b3-40be-9378-e44c8f45787d';
    
    // Create the record to upsert
    const record = {
      id: progressId,
      progress_data: progressData,
      last_updated: new Date().toISOString(),
      progress_type: 'laptop_collection' 
    };
    
    if (isComplete) {
      console.log('🏁 Collection complete! Saving final progress...');
    } else {
      console.log(`📊 Saving progress - Group: ${groupIndex + 1}, Brand: ${brandIndex + 1}`);
      console.log(`📈 Current stats: Processed: ${stats.processed}, Added: ${stats.added}, Updated: ${stats.updated}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);
    }
    
    const { error } = await supabase
      .from('collection_progress')
      .upsert(record);
      
    if (error) {
      console.error('❌ Error saving collection progress:', error);
    } else {
      console.log('✅ Collection progress saved successfully');
    }
  } catch (e) {
    console.error('❌ Error in saveCollectionProgress:', e);
  }
}

/**
 * Get the last saved collection progress from the database
 * @returns The last saved progress data, or null if none exists
 */
export async function getLastCollectionProgress() {
  try {
    console.log('🔍 Checking for previous collection progress...');
    
    const { data, error } = await supabase
      .from('collection_progress')
      .select('*')
      .eq('id', '7c75e6fe-c6b3-40be-9378-e44c8f45787d')
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No previous collection progress found, starting fresh');
        return null;
      }
      console.error('❌ Error fetching collection progress:', error);
      return null;
    }
    
    if (data && data.progress_data) {
      const progressData = data.progress_data as any;
      console.log(`🔄 Found previous progress - Group: ${progressData.groupIndex + 1}, Brand: ${progressData.brandIndex + 1}`);
      if (progressData.stats) {
        console.log(`📊 Previous stats: Processed: ${progressData.stats.processed}, Added: ${progressData.stats.added}, Updated: ${progressData.stats.updated}, Failed: ${progressData.stats.failed}, Skipped: ${progressData.stats.skipped || 0}`);
      }
    }
    
    return data;
  } catch (e) {
    console.error('❌ Error in getLastCollectionProgress:', e);
    return null;
  }
}

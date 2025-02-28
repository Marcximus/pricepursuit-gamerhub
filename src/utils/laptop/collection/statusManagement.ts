
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { CollectionProgressData, CollectionStats } from "../types";

/**
 * Reset any stale collection processes (those that have been "in_progress" for too long)
 * @param staleTimeout ISO date string representing the cutoff time for stale processes
 */
export async function resetStaleCollections(staleTimeout: string) {
  const { error: cleanupError } = await supabase
    .from('products')
    .update({ collection_status: 'pending' })
    .eq('collection_status', 'in_progress')
    .lt('last_collection_attempt', staleTimeout);

  if (cleanupError) {
    console.error('Error cleaning up stale statuses:', cleanupError);
    throw cleanupError;
  }
}

/**
 * Check if there are any active collections currently in progress
 * @param staleTimeout ISO date string representing the cutoff time for stale processes
 * @returns Array of active collection records
 */
export async function checkActiveCollections(staleTimeout: string) {
  const { data: activeCollections, error: statusError } = await supabase
    .from('products')
    .select('collection_status, last_collection_attempt')
    .eq('collection_status', 'in_progress')
    .gt('last_collection_attempt', staleTimeout)
    .limit(1);

  if (statusError) {
    console.error('Status check error:', statusError);
    throw statusError;
  }

  return activeCollections;
}

/**
 * Update the collection status for a specific brand
 * @param brand Brand name to update
 * @param status New status ('in_progress', 'completed', or 'pending')
 */
export async function updateBrandStatus(brand: string, status: 'in_progress' | 'completed' | 'pending') {
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
    
    // Generate a UUID for the ID field - use a fixed ID to ensure we're always updating the same record
    const progressId = '7c75e6fe-c6b3-40be-9378-e44c8f45787d';
    
    // Create the record to upsert
    const record = {
      id: progressId, // Use a UUID string ID instead of "1"
      progress_data: progressData,
      last_updated: new Date().toISOString(),
      progress_type: 'laptop_collection' 
    };
    
    const { error } = await supabase
      .from('collection_progress')
      .upsert(record);
      
    if (error) {
      console.error('Error saving collection progress:', error);
    } else {
      console.log('Collection progress saved successfully', { groupIndex, brandIndex, isComplete });
    }
  } catch (e) {
    console.error('Error in saveCollectionProgress:', e);
  }
}

/**
 * Get the last saved collection progress from the database
 * @returns The last saved progress data, or null if none exists
 */
export async function getLastCollectionProgress() {
  try {
    const { data, error } = await supabase
      .from('collection_progress')
      .select('*')
      .eq('id', '7c75e6fe-c6b3-40be-9378-e44c8f45787d') // Use the same UUID we use for saving
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No record found, return null
        return null;
      }
      console.error('Error fetching collection progress:', error);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Error in getLastCollectionProgress:', e);
    return null;
  }
}

/**
 * Process a page of products for a specific brand
 * @param brand Brand name
 * @param page Page number
 * @param groupIndex Current group index
 * @param brandIndex Current brand index within group
 * @param totalBrands Total number of brands
 * @returns Processing result with stats
 */
export async function processPage(
  brand: string,
  page: number,
  groupIndex: number,
  brandIndex: number,
  totalBrands: number
) {
  try {
    console.log(`Processing ${brand} page ${page} (group ${groupIndex + 1}, brand ${brandIndex + 1}/${totalBrands})`);
    
    // In a real implementation, this would fetch product data from an API
    // and process it, but for this example we'll just simulate some results
    const stats = {
      processed: Math.floor(Math.random() * 10) + 5,
      updated: Math.floor(Math.random() * 3),
      added: Math.floor(Math.random() * 5),
      failed: Math.floor(Math.random() * 2),
      skipped: Math.floor(Math.random() * 3)
    };
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, page, brand, stats };
  } catch (error) {
    console.error(`Error processing ${brand} page ${page}:`, error);
    return { success: false, page, brand, error };
  }
}

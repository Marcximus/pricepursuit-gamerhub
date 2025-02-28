
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CollectionStats } from "./types";

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

export async function processPage(brand: string, page: number, groupIndex: number, brandIndex: number, totalBrands: number) {
  console.log(`Processing ${brand} page ${page}, batch ${groupIndex * 2 + brandIndex + 1}/${totalBrands}`);
  
  const { data: response, error: functionError } = await supabase.functions.invoke('collect-laptops', {
    body: {
      brands: [brand],
      pages_per_brand: 1,
      current_page: page,
      batch_number: groupIndex * 2 + brandIndex + 1,
      total_batches: totalBrands
    }
  });

  if (functionError) {
    if (functionError.message?.includes('duplicate key value violates unique constraint')) {
      console.warn(`Duplicate ASIN found for ${brand} page ${page}`, functionError);
      return {
        stats: {
          processed: 0,
          updated: 0,
          added: 0,
          failed: 0,
          skipped: 1
        }
      };
    }
    
    console.error(`Edge function error for ${brand} page ${page}:`, functionError);
    return null;
  }

  return response;
}

/**
 * Save the current collection progress to the database
 * @param groupIndex Current group index
 * @param brandIndex Current brand index within the group
 * @param stats Current collection statistics
 * @param completed Whether the collection has completed (to clear the progress)
 * @returns 
 */
export async function saveCollectionProgress(
  groupIndex: number, 
  brandIndex: number, 
  stats: CollectionStats,
  completed = false
) {
  try {
    // Check if we have a collection_progress record
    const { data: existingProgress, error: checkError } = await supabase
      .from('collection_progress')
      .select('id')
      .eq('progress_type', 'laptop_collection')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing progress:', checkError);
      return false;
    }
    
    const progressData = completed ? null : {
      groupIndex,
      brandIndex,
      timestamp: new Date().toISOString(),
      stats
    };
    
    if (existingProgress && existingProgress.length > 0) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('collection_progress')
        .update({
          progress_data: progressData,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingProgress[0].id);
      
      if (updateError) {
        console.error('Error updating collection progress:', updateError);
        return false;
      }
    } else {
      // Create new progress record
      const { error: insertError } = await supabase
        .from('collection_progress')
        .insert({
          progress_type: 'laptop_collection',
          progress_data: progressData,
          last_updated: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error saving collection progress:', insertError);
        return false;
      }
    }
    
    console.log(`Progress saved: Group ${groupIndex}, Brand ${brandIndex}${completed ? ' (Collection Completed)' : ''}`);
    return true;
  } catch (error) {
    console.error('Error saving collection progress:', error);
    return false;
  }
}

/**
 * Get the last saved collection progress
 * @returns The last saved progress data or null if none exists
 */
export async function getLastCollectionProgress() {
  try {
    const { data, error } = await supabase
      .from('collection_progress')
      .select('*')
      .eq('progress_type', 'laptop_collection')
      .order('last_updated', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error getting collection progress:', error);
      return null;
    }
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting collection progress:', error);
    return null;
  }
}

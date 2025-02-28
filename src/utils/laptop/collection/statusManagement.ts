
import { supabase } from "@/integrations/supabase/client";

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

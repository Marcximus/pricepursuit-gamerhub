
import { supabase } from "@/integrations/supabase/client";
import { CollectionStats, CollectionProgressData } from "../types";
import { Json } from "@/integrations/supabase/types";

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
    
    // Create the progress data object
    const progressData: CollectionProgressData | null = completed ? null : {
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
          progress_data: progressData as unknown as Json,
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
          progress_data: progressData as unknown as Json,
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

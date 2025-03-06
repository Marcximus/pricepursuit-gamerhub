
import { supabase } from "@/integrations/supabase/client";
import { StatsCountResult } from "./types";

/**
 * Get count of laptops not updated in the last 24 hours
 */
export async function getNotUpdatedLaptopsCount(): Promise<StatsCountResult> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .lt('last_updated', oneDayAgo.toISOString());
  
  if (error) {
    console.error('Error fetching not updated count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops not checked in the last 24 hours
 */
export async function getNotCheckedLaptopsCount(): Promise<StatsCountResult> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .lt('last_checked', oneDayAgo.toISOString());
  
  if (error) {
    console.error('Error fetching not checked count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops with pending update status
 */
export async function getPendingUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('update_status', 'pending');
  
  if (error) {
    console.error('Error fetching pending update count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops with in-progress update status
 */
export async function getInProgressUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .in('update_status', ['pending_update', 'in_progress']);
  
  if (error) {
    console.error('Error fetching in-progress update count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops with completed update status
 */
export async function getCompletedUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('update_status', 'completed');
  
  if (error) {
    console.error('Error fetching completed update count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops with error update status
 */
export async function getErrorUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .in('update_status', ['error', 'timeout']);
  
  if (error) {
    console.error('Error fetching error update count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops updated in the last 24 hours
 */
export async function getUpdatedLast24HoursCount(): Promise<StatsCountResult> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .gte('last_updated', oneDayAgo.toISOString());
  
  if (error) {
    console.error('Error fetching updated last 24 hours count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Get count of laptops updated in the last 7 days
 */
export async function getUpdatedLast7DaysCount(): Promise<StatsCountResult> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .gte('last_updated', sevenDaysAgo.toISOString());
  
  if (error) {
    console.error('Error fetching updated last 7 days count:', error);
    return { count: 0, error };
  }
  
  return { count: count || 0, error: null };
}

/**
 * Reset stale pending updates that have been stuck for too long
 */
export async function resetStalePendingUpdates(): Promise<void> {
  try {
    console.log('Starting to reset stale update statuses...');
    
    // Consider updates stuck if they've been in intermediate status for more than 30 minutes
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    // First, check how many are stuck
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .in('update_status', ['pending_update', 'in_progress'])
      .lt('last_checked', thirtyMinutesAgo.toISOString());
      
    if (countError) {
      console.error('Error counting stale updates:', countError);
      return;
    }
    
    console.log(`Found ${count || 0} laptops stuck in intermediate update states for more than 30 minutes`);
    
    // Reset pending_update and in_progress statuses that have been stuck
    const { error: pendingUpdateError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending',
        last_checked: new Date().toISOString()
      })
      .eq('is_laptop', true)
      .in('update_status', ['pending_update', 'in_progress'])
      .lt('last_checked', thirtyMinutesAgo.toISOString());
    
    if (pendingUpdateError) {
      console.error('Error resetting stale pending updates:', pendingUpdateError);
      return;
    }

    // Also reset any stuck error or timeout laptops that haven't been retried in over 12 hours
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
    
    const { error: errorResetError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending',
        last_checked: new Date().toISOString()
      })
      .eq('is_laptop', true)
      .in('update_status', ['error', 'timeout'])
      .lt('last_checked', twelveHoursAgo.toISOString());
      
    if (errorResetError) {
      console.error('Error resetting stale error statuses:', errorResetError);
      return;
    }
    
    console.log('Successfully reset all stale update statuses');
  } catch (err) {
    console.error('Exception during stale updates reset:', err);
  }
}


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
  }
  
  return { count: count || 0, error };
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
  }
  
  return { count: count || 0, error };
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
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with in-progress update status
 */
export async function getInProgressUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('update_status', 'pending_update');
  
  if (error) {
    console.error('Error fetching in-progress update count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with completed update status
 */
export async function getCompletedUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('update_status', 'complete');
  
  if (error) {
    console.error('Error fetching completed update count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with error update status
 */
export async function getErrorUpdateLaptopsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .eq('update_status', 'error');
  
  if (error) {
    console.error('Error fetching error update count:', error);
  }
  
  return { count: count || 0, error };
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
  }
  
  return { count: count || 0, error };
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
  }
  
  return { count: count || 0, error };
}

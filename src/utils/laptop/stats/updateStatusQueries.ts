
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
 * Get count of laptops checked in the last 24 hours
 */
export async function getRecentlyCheckedLaptopsCount(): Promise<StatsCountResult> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .gte('last_checked', oneDayAgo.toISOString());
  
  if (error) {
    console.error('Error fetching recently checked count:', error);
  }
  
  return { count: count || 0, error };
}

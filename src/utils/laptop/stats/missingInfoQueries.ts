
import { supabase } from "@/integrations/supabase/client";
import { StatsCountResult } from "./types";

/**
 * Get count of laptops with no processor information
 */
export async function getNoProcessorCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .or('processor.is.null,processor.eq.')
  
  if (error) {
    console.error('Error fetching no processor count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with no RAM information
 */
export async function getNoRamCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .or('ram.is.null,ram.eq.')
  
  if (error) {
    console.error('Error fetching no RAM count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with no storage information
 */
export async function getNoStorageCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .or('storage.is.null,storage.eq.')
  
  if (error) {
    console.error('Error fetching no storage count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with no graphics information
 */
export async function getNoGraphicsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .or('graphics.is.null,graphics.eq.')
  
  if (error) {
    console.error('Error fetching no graphics count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops missing any specification
 */
export async function getMissingAnySpecCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .or('processor.is.null,processor.eq.,ram.is.null,ram.eq.,storage.is.null,storage.eq.,graphics.is.null,graphics.eq.')
  
  if (error) {
    console.error('Error fetching missing any spec count:', error);
  }
  
  return { count: count || 0, error };
}

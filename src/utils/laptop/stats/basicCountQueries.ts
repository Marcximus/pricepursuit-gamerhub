
import { supabase } from "@/integrations/supabase/client";
import { StatsCountResult } from "./types";

/**
 * Get total count of laptop products
 */
export async function getTotalLaptopCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true);
  
  if (error) {
    console.error('Error fetching total count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid prices
 */
export async function getLaptopsWithPriceCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('current_price', 'is', null);
  
  if (error) {
    console.error('Error fetching price count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid processor data
 */
export async function getLaptopsWithProcessorCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('processor', 'is', null)
    .neq('processor', '');
  
  if (error) {
    console.error('Error fetching processor count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid RAM data
 */
export async function getLaptopsWithRamCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('ram', 'is', null)
    .neq('ram', '');
  
  if (error) {
    console.error('Error fetching RAM count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid storage data
 */
export async function getLaptopsWithStorageCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('storage', 'is', null)
    .neq('storage', '');
  
  if (error) {
    console.error('Error fetching storage count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid graphics data
 */
export async function getLaptopsWithGraphicsCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('graphics', 'is', null)
    .neq('graphics', '');
  
  if (error) {
    console.error('Error fetching graphics count:', error);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid screen size data
 */
export async function getLaptopsWithScreenSizeCount(): Promise<StatsCountResult> {
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('screen_size', 'is', null)
    .neq('screen_size', '');
  
  if (error) {
    console.error('Error fetching screen size count:', error);
  }
  
  return { count: count || 0, error };
}

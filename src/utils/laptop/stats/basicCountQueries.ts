
import { supabase } from "@/integrations/supabase/client";
import { StatsCountResult } from "./types";

/**
 * Get total count of laptop products
 */
export async function getTotalLaptopCount(): Promise<StatsCountResult> {
  console.log('Executing getTotalLaptopCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true);
  
  if (error) {
    console.error('Error fetching total count:', error);
  } else {
    console.log(`Total laptop count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid prices
 */
export async function getLaptopsWithPriceCount(): Promise<StatsCountResult> {
  console.log('Executing getLaptopsWithPriceCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('current_price', 'is', null);
  
  if (error) {
    console.error('Error fetching price count:', error);
  } else {
    console.log(`Laptops with price count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid processor data
 */
export async function getLaptopsWithProcessorCount(): Promise<StatsCountResult> {
  console.log('Executing getLaptopsWithProcessorCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('processor', 'is', null)
    .neq('processor', '');
  
  if (error) {
    console.error('Error fetching processor count:', error);
  } else {
    console.log(`Laptops with processor count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid RAM data
 */
export async function getLaptopsWithRamCount(): Promise<StatsCountResult> {
  console.log('Executing getLaptopsWithRamCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('ram', 'is', null)
    .neq('ram', '');
  
  if (error) {
    console.error('Error fetching RAM count:', error);
  } else {
    console.log(`Laptops with RAM count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid storage data
 */
export async function getLaptopsWithStorageCount(): Promise<StatsCountResult> {
  console.log('Executing getLaptopsWithStorageCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('storage', 'is', null)
    .neq('storage', '');
  
  if (error) {
    console.error('Error fetching storage count:', error);
  } else {
    console.log(`Laptops with storage count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid graphics data
 */
export async function getLaptopsWithGraphicsCount(): Promise<StatsCountResult> {
  console.log('Executing getLaptopsWithGraphicsCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('graphics', 'is', null)
    .neq('graphics', '');
  
  if (error) {
    console.error('Error fetching graphics count:', error);
  } else {
    console.log(`Laptops with graphics count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get count of laptops with valid screen size data
 */
export async function getLaptopsWithScreenSizeCount(): Promise<StatsCountResult> {
  console.log('Executing getLaptopsWithScreenSizeCount query...');
  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true)
    .not('screen_size', 'is', null)
    .neq('screen_size', '');
  
  if (error) {
    console.error('Error fetching screen size count:', error);
  } else {
    console.log(`Laptops with screen size count result: ${count}`);
  }
  
  return { count: count || 0, error };
}

/**
 * Get random sample of missing data items for inspection
 */
export async function getSampleMissingDataItems(field: string, limit: number = 10): Promise<any> {
  console.log(`Fetching sample of ${limit} items missing ${field} data...`);
  const { data, error } = await supabase
    .from('products')
    .select('id, title, asin, brand, model')
    .eq('is_laptop', true)
    .or(`${field}.is.null,${field}.eq.''`)
    .limit(limit);
  
  if (error) {
    console.error(`Error fetching sample missing ${field} items:`, error);
    return { data: [], error };
  }
  
  console.log(`Retrieved ${data?.length || 0} sample items missing ${field} data`);
  return { data, error };
}

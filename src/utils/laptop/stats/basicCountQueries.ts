
import { supabase } from "@/integrations/supabase/client";
import { StatsCountResult } from "./types";

/**
 * Get total count of laptop products in database
 */
export async function getTotalLaptopCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true);
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting total laptop count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid price data
 */
export async function getLaptopsWithPriceCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('current_price', 'is', null)
      .gt('current_price', 0); // Ensure price is actually valid (greater than 0)
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with price count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid processor data
 */
export async function getLaptopsWithProcessorCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('processor', 'is', null)
      .not('processor', 'eq', '')
      .not('processor', 'ilike', '%undefined%'); // Filter out "undefined" text
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with processor count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid RAM data
 */
export async function getLaptopsWithRamCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('ram', 'is', null)
      .not('ram', 'eq', '')
      .not('ram', 'ilike', '%undefined%'); // Filter out "undefined" text
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with RAM count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid storage data
 */
export async function getLaptopsWithStorageCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('storage', 'is', null)
      .not('storage', 'eq', '')
      .not('storage', 'ilike', '%undefined%'); // Filter out "undefined" text
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with storage count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid graphics data
 */
export async function getLaptopsWithGraphicsCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('graphics', 'is', null)
      .not('graphics', 'eq', '')
      .not('graphics', 'ilike', '%undefined%'); // Filter out "undefined" text
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with graphics count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid screen size data
 */
export async function getLaptopsWithScreenSizeCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('screen_size', 'is', null)
      .not('screen_size', 'eq', '')
      .not('screen_size', 'ilike', '%undefined%'); // Filter out "undefined" text
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with screen size count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get count of laptops with valid image URLs
 */
export async function getLaptopsWithImageCount(): Promise<StatsCountResult> {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .not('image_url', 'ilike', '%undefined%')
      .not('image_url', 'ilike', '%null%'); // Filter out cases where "null" is stored as a string
    
    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting laptops with image count:', error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Get a sample of laptops with missing data for diagnosis
 */
export async function getSampleLaptopsWithMissingData(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, asin, title, current_price, processor, ram, storage, graphics, screen_size, image_url, last_checked, update_status')
      .eq('is_laptop', true)
      .or('processor.is.null,ram.is.null,storage.is.null,graphics.is.null,screen_size.is.null,image_url.is.null')
      .order('last_checked', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting sample laptops with missing data:', error);
    return [];
  }
}

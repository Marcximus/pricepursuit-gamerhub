
import { supabase } from "@/integrations/supabase/client";
import { logFetchProgress, getLaptopColumns } from "./utils";

export const BATCH_SIZE = 1000;

/**
 * Processes laptops in batches with pagination
 */
export async function fetchLaptopsInBatches(minimalForFilters = false) {
  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  logFetchProgress(`Starting to fetch ${minimalForFilters ? 'minimal' : 'all'} laptops in batches...`);

  while (hasMore) {
    let query = supabase
      .from('products')
      .select(getLaptopColumns(minimalForFilters))
      .eq('is_laptop', true)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: laptops, error } = await query;

    if (error) {
      console.error('Error fetching laptops batch:', error);
      throw error;
    }

    if (!laptops || laptops.length === 0) {
      hasMore = false;
      break;
    }

    allLaptops = [...allLaptops, ...laptops];
    
    // Get last ID for pagination
    lastId = getLastIdFromBatch(laptops);
    
    if (laptops.length < BATCH_SIZE) {
      hasMore = false;
    }

    logFetchProgress(`Fetched batch of ${laptops.length} laptops, total so far: ${allLaptops.length}`);
  }

  logFetchProgress(`Completed fetching ${minimalForFilters ? 'minimal' : 'all'} laptops. Total count: ${allLaptops.length}`);
  return allLaptops;
}

/**
 * Extracts the last ID from a batch of laptops for pagination
 */
function getLastIdFromBatch(laptops: any[]): string | null {
  if (!laptops || laptops.length === 0) {
    return null;
  }

  const lastLaptopIndex = laptops.length - 1;
  const potentialLastLaptop = laptops[lastLaptopIndex];
  
  // First check if potentialLastLaptop exists at all
  if (potentialLastLaptop === null || potentialLastLaptop === undefined) {
    console.warn('Last laptop in the batch is null or undefined, stopping pagination');
    return null;
  }
  
  // Then verify it's an object with a valid ID property
  if (typeof potentialLastLaptop !== 'object' || potentialLastLaptop === null) {
    console.warn('Last laptop is not a valid object, stopping pagination');
    return null;
  }
  
  if (!('id' in potentialLastLaptop) || !potentialLastLaptop.id) {
    console.warn('No valid ID found in the last laptop of the batch, stopping pagination');
    return null;
  }
  
  return potentialLastLaptop.id;
}


import { supabase } from "@/integrations/supabase/client";
import { logFetchProgress, getLaptopColumns } from "./utils";
import type { Product } from "@/types/product";

export const BATCH_SIZE = 1000;

/**
 * Processes laptops in batches with pagination
 */
export async function fetchLaptopsInBatches(minimalForFilters = false): Promise<Product[]> {
  let allLaptops: Product[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  logFetchProgress(`Starting to fetch ${minimalForFilters ? 'minimal' : 'all'} laptops in batches...`);

  try {
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

      // Validate the data is what we expect before using it
      if (Array.isArray(laptops)) {
        // Convert to proper Product type and validate the data has required fields
        const validLaptops = laptops
          .filter(laptop => 
            laptop && typeof laptop === 'object' && 'id' in laptop
          )
          .map(laptop => laptop as unknown as Product);
        
        allLaptops = [...allLaptops, ...validLaptops];
        
        // Get last ID for pagination
        lastId = getLastIdFromBatch(validLaptops);
        
        if (laptops.length < BATCH_SIZE) {
          hasMore = false;
        }

        logFetchProgress(`Fetched batch of ${validLaptops.length} laptops, total so far: ${allLaptops.length}`);
      } else {
        console.error('Invalid laptops data returned from database:', laptops);
        hasMore = false;
      }
    }
  } catch (err) {
    console.error('Error in fetchLaptopsInBatches:', err);
    // Return the laptops we managed to get before the error
    logFetchProgress(`Error occurred after fetching ${allLaptops.length} laptops. Returning partial data.`);
  }

  logFetchProgress(`Completed fetching ${minimalForFilters ? 'minimal' : 'all'} laptops. Total count: ${allLaptops.length}`);
  return allLaptops;
}

/**
 * Extracts the last ID from a batch of laptops for pagination
 */
function getLastIdFromBatch(laptops: Product[]): string | null {
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
  
  // Verify it has a valid ID property
  if (!potentialLastLaptop.id) {
    console.warn('No valid ID found in the last laptop of the batch, stopping pagination');
    return null;
  }
  
  return potentialLastLaptop.id;
}

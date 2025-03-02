
import { supabase } from "@/integrations/supabase/client";

const BATCH_SIZE = 1000;
const INITIAL_FETCH_LIMIT = 250; // A small enough number to load quickly

// Cache for the laptops data to avoid redundant fetches
let laptopsCache: any[] | null = null;
let initialLaptopsCache: any[] | null = null;
let lastFetchTime: number = 0;
let lastInitialFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fast query to get just enough data to show something immediately
export async function fetchInitialLaptops() {
  // Check if we have a valid cache
  const now = Date.now();
  if (initialLaptopsCache && (now - lastInitialFetchTime < CACHE_DURATION)) {
    console.log('Using cached initial laptop data, age:', (now - lastInitialFetchTime) / 1000, 'seconds');
    return initialLaptopsCache;
  }

  console.log('Fetching initial laptops for fast display...');

  try {
    const { data: laptops, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        current_price,
        original_price,
        rating,
        rating_count,
        image_url,
        processor,
        ram,
        storage,
        graphics,
        screen_size,
        screen_resolution,
        weight,
        processor_score,
        brand,
        model,
        asin,
        product_url,
        last_checked,
        created_at,
        wilson_score
      `)
      .eq('is_laptop', true)
      .order('wilson_score', { ascending: false }) // Get high quality items first
      .limit(INITIAL_FETCH_LIMIT);

    if (error) {
      console.error('Error fetching initial laptops:', error);
      throw error;
    }

    console.log(`Fetched ${laptops.length} initial laptops for fast display`);
    
    // Update cache
    initialLaptopsCache = laptops;
    lastInitialFetchTime = now;
    
    return laptops;
  } catch (error) {
    console.error('Error in fetchInitialLaptops:', error);
    throw error;
  }
}

export async function fetchAllLaptops() {
  // Check if we have a valid cache
  const now = Date.now();
  if (laptopsCache && (now - lastFetchTime < CACHE_DURATION)) {
    console.log('Using cached laptop data, age:', (now - lastFetchTime) / 1000, 'seconds');
    return laptopsCache;
  }

  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  console.log('Starting to fetch all laptops in batches...');

  try {
    while (hasMore) {
      let query = supabase
        .from('products')
        .select(`
          id,
          title,
          current_price,
          original_price,
          rating,
          rating_count,
          image_url,
          processor,
          ram,
          storage,
          graphics,
          screen_size,
          screen_resolution,
          weight,
          processor_score,
          brand,
          model,
          asin,
          product_url,
          last_checked,
          created_at,
          wilson_score,
          product_reviews (
            id,
            rating,
            title,
            content,
            reviewer_name,
            review_date,
            verified_purchase,
            helpful_votes
          )
        `)
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
      lastId = laptops[laptops.length - 1].id;

      if (laptops.length < BATCH_SIZE) {
        hasMore = false;
      }

      console.log(`Fetched batch of ${laptops.length} laptops, total so far: ${allLaptops.length}`);
    }

    console.log(`Completed fetching all laptops. Total count: ${allLaptops.length}`);
    
    // Update cache
    laptopsCache = allLaptops;
    lastFetchTime = now;
    
    return allLaptops;
  } catch (error) {
    console.error('Error in fetchAllLaptops:', error);
    // If we have a cache, return it even on error for better UX
    if (laptopsCache) {
      console.log('Falling back to cached data due to fetch error');
      return laptopsCache;
    }
    throw error;
  }
}

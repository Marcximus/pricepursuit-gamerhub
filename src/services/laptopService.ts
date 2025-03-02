
import { supabase } from "@/integrations/supabase/client";

const BATCH_SIZE = 1000;
const CACHE_KEY = 'cached_laptops';
const CACHE_EXPIRY_KEY = 'cached_laptops_expiry';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function fetchAllLaptops() {
  console.log('Starting laptop fetch process...');
  
  // Check for cached data first
  const cachedData = checkCache();
  if (cachedData) {
    console.log('Retrieved laptops from cache');
    return cachedData;
  }
  
  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  console.log('Cache miss or expired. Fetching all laptops in batches...');

  // Show progress as batches are loaded
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
    
    // Cache the data for future use
    cacheData(allLaptops);
    
    return allLaptops;
  } catch (error) {
    console.error('Error in fetchAllLaptops:', error);
    // If we have a cache but it's expired, use it in case of errors
    const expiredCache = localStorage.getItem(CACHE_KEY);
    if (expiredCache) {
      console.log('Error occurred, falling back to expired cache');
      return JSON.parse(expiredCache);
    }
    throw error;
  }
}

// Helper function to check cache
function checkCache() {
  try {
    const expiryTime = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiryTime) return null;
    
    const isExpired = parseInt(expiryTime) < Date.now();
    if (isExpired) {
      console.log('Cache expired');
      return null;
    }
    
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

// Helper function to cache data
function cacheData(data: any[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    console.log('Laptops cached successfully');
  } catch (error) {
    console.error('Error caching laptops:', error);
    // If error is due to quota exceeded, clear old data
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      localStorage.clear();
      console.log('Local storage cleared due to quota exceeded');
    }
  }
}

// Add a method to get a small initial set of laptops
export async function fetchInitialLaptops() {
  try {
    const { data, error } = await supabase
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
        brand
      `)
      .eq('is_laptop', true)
      .order('wilson_score', { ascending: false })
      .limit(20);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching initial laptops:', error);
    return [];
  }
}

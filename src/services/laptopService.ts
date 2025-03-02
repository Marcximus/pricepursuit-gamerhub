
import { supabase } from "@/integrations/supabase/client";

const BATCH_SIZE = 1000;
const CACHE_KEY = 'preloaded-laptops-data';
const CACHE_EXPIRY_KEY = 'preloaded-laptops-expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Global window property for embedded laptop data
declare global {
  interface Window {
    EMBEDDED_LAPTOP_DATA?: any[];
  }
}

/**
 * Store laptop data in localStorage with expiration
 */
function cacheLaptops(laptops: any[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(laptops));
    localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    console.log(`Cached ${laptops.length} laptops in localStorage`);
  } catch (error) {
    console.error('Error caching laptops:', error);
    // If storing fails (e.g., quota exceeded), try to clear the cache and retry
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
      localStorage.setItem(CACHE_KEY, JSON.stringify(laptops));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (retryError) {
      console.error('Failed to cache laptops even after retry:', retryError);
    }
  }
}

/**
 * Get cached laptop data if available and not expired
 */
function getCachedLaptops(): any[] | null {
  try {
    const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiryStr) return null;
    
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) {
      console.log('Cached laptop data expired');
      return null;
    }
    
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    
    const laptops = JSON.parse(cachedData);
    console.log(`Retrieved ${laptops.length} laptops from cache`);
    return laptops;
  } catch (error) {
    console.error('Error retrieving cached laptops:', error);
    return null;
  }
}

/**
 * Get embedded laptop data from window object if available
 */
function getEmbeddedLaptops(): any[] | null {
  if (window.EMBEDDED_LAPTOP_DATA && Array.isArray(window.EMBEDDED_LAPTOP_DATA) && window.EMBEDDED_LAPTOP_DATA.length > 0) {
    console.log(`Using ${window.EMBEDDED_LAPTOP_DATA.length} laptops from embedded data`);
    // Once we've used the embedded data, we can cache it for future visits
    cacheLaptops(window.EMBEDDED_LAPTOP_DATA);
    return window.EMBEDDED_LAPTOP_DATA;
  }
  return null;
}

/**
 * Fetch all laptops with batching strategy, with client-side caching
 */
export async function fetchAllLaptops() {
  // First check for embedded data (fastest, available on first page load)
  const embeddedLaptops = getEmbeddedLaptops();
  if (embeddedLaptops && embeddedLaptops.length > 0) {
    return embeddedLaptops;
  }

  // Next try to get data from cache
  const cachedLaptops = getCachedLaptops();
  if (cachedLaptops && cachedLaptops.length > 0) {
    console.log('Using cached laptop data');
    return cachedLaptops;
  }

  console.log('No embedded or cached data - fetching all laptops from server...');
  
  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

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
    
    // Cache the fetched data for future use
    if (allLaptops.length > 0) {
      cacheLaptops(allLaptops);
    }
    
    return allLaptops;
  } catch (error) {
    console.error('Error in fetchAllLaptops:', error);
    
    // If we have stale cache, return it as fallback
    const staleCachedData = localStorage.getItem(CACHE_KEY);
    if (staleCachedData) {
      try {
        const staleData = JSON.parse(staleCachedData);
        console.log(`Falling back to stale cached data with ${staleData.length} laptops`);
        return staleData;
      } catch (cacheError) {
        console.error('Error parsing stale cache:', cacheError);
      }
    }
    
    throw error;
  }
}

/**
 * Initialize preloading of laptop data
 */
export function preloadLaptopData(): Promise<void> {
  // If we already have embedded data, no need to preload
  if (window.EMBEDDED_LAPTOP_DATA && Array.isArray(window.EMBEDDED_LAPTOP_DATA) && window.EMBEDDED_LAPTOP_DATA.length > 0) {
    console.log(`Already have ${window.EMBEDDED_LAPTOP_DATA.length} embedded laptops, skipping preload`);
    return Promise.resolve();
  }

  console.log('Preloading laptop data...');
  return fetchAllLaptops()
    .then(data => {
      console.log(`Preloaded ${data.length} laptops successfully`);
    })
    .catch(error => {
      console.error('Failed to preload laptop data:', error);
    });
}

/**
 * Create script tag content to embed laptop data in HTML
 */
export function generateEmbeddedDataScript(laptops: any[]): string {
  // Create a safe serialized version of the laptop data
  const safeJson = JSON.stringify(laptops).replace(/<\/script>/g, '<\\/script>');
  return `window.EMBEDDED_LAPTOP_DATA = ${safeJson};`;
}

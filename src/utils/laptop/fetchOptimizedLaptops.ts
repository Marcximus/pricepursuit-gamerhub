
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { cachedFetch, cache } from "@/lib/cache";

// Add TypeScript interface for the paginated response
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Export the filter params interface with all possible filter fields
export interface LaptopFilterParams {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  processor?: string;
  storage?: string;
  graphics?: string;
  screenSize?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Fetches laptops with optimized performance using serverless function
 * Now with client-side caching for better performance and support for larger result sets
 */
export async function fetchOptimizedLaptops({
  brand = '',
  minPrice = undefined,
  maxPrice = undefined,
  ram = '',
  processor = '',
  storage = '',
  graphics = '',
  screenSize = '',
  sortBy = 'wilson_score',
  sortDir = 'desc',
  page = 1,
  pageSize = 500
}: LaptopFilterParams): Promise<PaginatedResponse<Product>> {
  // Build query parameters
  const params = new URLSearchParams();
  
  // Add all filter parameters that are not undefined
  if (brand) params.append('brand', brand);
  if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
  if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
  if (ram) params.append('ram', ram);
  if (processor) params.append('processor', processor);
  if (storage) params.append('storage', storage);
  if (graphics) params.append('graphics', graphics);
  if (screenSize) params.append('screenSize', screenSize);
  
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  // Convert params to string for caching key
  const queryString = params.toString();
  console.log(`Fetching laptops with params: ${queryString}`);
  
  // Determine cache time based on filter specificity - shorter cache for filtered results
  const filterCount = [brand, minPrice, maxPrice, ram, processor, storage, graphics, screenSize].filter(Boolean).length;
  const cacheTime = filterCount > 0 
    ? 5 * 60 * 1000   // 5 minutes for filtered results
    : 10 * 60 * 1000; // 10 minutes for unfiltered results

  try {
    // Check if we have a cached version first
    const cachedData = cache.get<PaginatedResponse<Product>>(`fetch-laptops-${queryString}`);
    if (cachedData) {
      console.log('Using cached laptop data');
      return cachedData;
    }
    
    // Try invoking the serverless function with POST method
    const { data, error } = await supabase.functions.invoke('fetch-laptops', {
      method: 'POST',
      body: { query: Object.fromEntries(params) },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error invoking function with POST:', error);
      
      // Get access token for the request
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || '';
      
      // If POST fails, try GET with the actual Supabase URL as a fallback
      // Use the actual Supabase URL rather than window.location.origin
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kkebyebrhdpcwqnxhjcx.supabase.co';
      const functionEndpoint = `${supabaseUrl}/functions/v1/fetch-laptops?${queryString}`;
      
      console.log(`Trying GET fallback with direct Supabase URL: ${functionEndpoint}`);
      
      const response = await fetch(functionEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error(`GET request failed: ${response.status} ${response.statusText}`, responseText);
        throw new Error(`GET request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // Cache the result for future use
      cache.set(`fetch-laptops-${queryString}`, data, { expiry: cacheTime });
      return data as PaginatedResponse<Product>;
    }

    // Cache the result for future use
    cache.set(`fetch-laptops-${queryString}`, data, { expiry: cacheTime });
    
    console.log(`Successfully fetched ${data?.data?.length || 0} laptops out of ${data?.meta?.totalCount || 0} total`);
    return data as PaginatedResponse<Product>;
  } catch (error) {
    console.error('Error fetching optimized laptops:', error);
    
    // Try to get from cache even if the request failed
    const cachedData = cache.get<PaginatedResponse<Product>>(`fetch-laptops-${queryString}`);
    if (cachedData) {
      console.log('Using cached data due to request failure');
      return cachedData;
    }
    
    throw error;
  }
}

/**
 * Function to clear product cache on specific actions
 */
export const clearLaptopCache = () => {
  cache.clear('fetch-laptops-');
};

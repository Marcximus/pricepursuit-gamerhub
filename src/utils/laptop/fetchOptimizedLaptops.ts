
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

// Export the filter params interface
export interface LaptopFilterParams {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  processor?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Fetches laptops with optimized performance using serverless function
 * Now with client-side caching for better performance
 */
export async function fetchOptimizedLaptops({
  brand = '',
  minPrice = undefined,
  maxPrice = undefined,
  ram = '',
  processor = '',
  sortBy = 'wilson_score',
  sortDir = 'desc',
  page = 1,
  pageSize = 20
}: LaptopFilterParams): Promise<PaginatedResponse<Product>> {
  // Build query parameters
  const params = new URLSearchParams();
  
  if (brand) params.append('brand', brand);
  if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
  if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
  if (ram) params.append('ram', ram);
  if (processor) params.append('processor', processor);
  
  params.append('sortBy', sortBy);
  params.append('sortDir', sortDir);
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());

  // Convert params to string for the URL
  const queryString = params.toString();
  
  // Determine cache time based on filter specificity
  const filterCount = [brand, minPrice, maxPrice, ram, processor].filter(Boolean).length;
  const cacheTime = filterCount > 2 
    ? 10 * 60 * 1000  // 10 minutes for specific filters
    : 2 * 60 * 1000;  // 2 minutes for general listings

  try {
    // Instead of trying to call the edge function via URL, use the Supabase client
    // This ensures proper authentication and error handling
    const { data, error } = await supabase.functions.invoke('fetch-laptops', {
      method: 'GET',
      // The correct way to pass query parameters in Supabase JS v2
      body: { query: Object.fromEntries(params) },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error invoking function:', error);
      throw error;
    }

    // Cache the result for future use
    cache.set(`fetch-laptops-${queryString}`, data, { expiry: cacheTime });
    
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
  cache.clear('fetch-');
};


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
    // Get the function URL properly using import.meta.env instead of process.env
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-laptops?${queryString}`;
    
    // Use our cached fetch implementation
    return await cachedFetch<PaginatedResponse<Product>>(
      functionUrl,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      },
      { expiry: cacheTime }
    );
  } catch (error) {
    console.error('Error fetching optimized laptops:', error);
    throw error;
  }
}

/**
 * Function to clear product cache on specific actions
 */
export const clearLaptopCache = () => {
  cache.clear('fetch-');
};

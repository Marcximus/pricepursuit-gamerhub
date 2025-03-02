
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
  filterOptions?: {
    brands: Set<string>;
    processors: Set<string>;
    ramSizes: Set<string>;
    storageOptions: Set<string>;
    graphicsCards: Set<string>;
    screenSizes: Set<string>;
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
  includeFilterOptions?: boolean;
}

/**
 * Fetches laptops with optimized performance using serverless function
 * Now with client-side caching for better performance and separate filter options query
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
  pageSize = 30,
  includeFilterOptions = false
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
  
  // Add flag to request filter options
  if (includeFilterOptions) {
    params.append('includeFilterOptions', 'true');
    
    // If this is just a filter options request (indicated by pageSize=1), we create a special 
    // cache key to ensure it's cached separately and for a longer time
    if (pageSize === 1) {
      const cacheKey = 'filter-options-only';
      const cachedOptions = cache.get<PaginatedResponse<Product>>(cacheKey);
      if (cachedOptions) {
        console.log('Using cached filter options');
        return cachedOptions;
      }
      
      console.log('Fetching ALL filter options from database');
      
      try {
        // Special request for ALL filter options
        const { data: filterOptionsData, error } = await supabase.functions.invoke('fetch-laptops', {
          method: 'POST',
          body: { 
            query: { includeFilterOptions: true, pageSize: 1, page: 1 },
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (error) {
          console.error('Error fetching filter options:', error);
          throw error;
        }
        
        // Convert arrays to Sets for filter options
        if (filterOptionsData?.filterOptions) {
          Object.keys(filterOptionsData.filterOptions).forEach(key => {
            filterOptionsData.filterOptions[key] = new Set(filterOptionsData.filterOptions[key]);
          });
        }
        
        // Cache filter options for a longer time (30 minutes)
        cache.set(cacheKey, filterOptionsData, { expiry: 30 * 60 * 1000 });
        
        return filterOptionsData as PaginatedResponse<Product>;
      } catch (error) {
        console.error('Error fetching filter options:', error);
        throw error;
      }
    }
  }

  // Convert params to string for caching key
  const queryString = params.toString();
  console.log(`Fetching laptops with params: ${queryString}`);
  
  // Determine cache time based on filter specificity - shorter cache for filtered results
  const filterCount = [brand, minPrice, maxPrice, ram, processor, storage, graphics, screenSize].filter(Boolean).length;
  const cacheTime = filterCount > 0 
    ? 5 * 60 * 1000   // 5 minutes for filtered results
    : 10 * 60 * 1000; // 10 minutes for unfiltered results

  // Special shorter cache time for filter options query
  const filterOptionsCacheTime = 5 * 60 * 1000; // 5 minutes

  try {
    // Check if we have a cached version first - use appropriate cache time based on query type
    const cacheKey = `fetch-laptops-${queryString}`;
    const cachedData = cache.get<PaginatedResponse<Product>>(cacheKey);
    if (cachedData) {
      console.log('Using cached laptop data');
      return cachedData;
    }
    
    // Try invoking the serverless function with POST method
    const { data, error } = await supabase.functions.invoke('fetch-laptops', {
      method: 'POST',
      body: { 
        query: Object.fromEntries(params),
        includeFilterOptions 
      },
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
      
      // If the data includes filter options, convert arrays to Sets
      if (data.filterOptions) {
        Object.keys(data.filterOptions).forEach(key => {
          data.filterOptions[key] = new Set(data.filterOptions[key]);
        });
      }
      
      // Cache the result for future use - use appropriate cache time
      const appropriateCacheTime = includeFilterOptions ? filterOptionsCacheTime : cacheTime;
      cache.set(cacheKey, data, { expiry: appropriateCacheTime });
      
      return data as PaginatedResponse<Product>;
    }

    // If the data includes filter options, convert arrays to Sets
    if (data?.filterOptions) {
      Object.keys(data.filterOptions).forEach(key => {
        data.filterOptions[key] = new Set(data.filterOptions[key]);
      });
    }

    // Cache the result for future use - use appropriate cache time
    const appropriateCacheTime = includeFilterOptions ? filterOptionsCacheTime : cacheTime;
    cache.set(cacheKey, data, { expiry: appropriateCacheTime });
    
    console.log(`Successfully fetched ${data?.data?.length || 0} laptops out of ${data?.meta?.totalCount || 0} total`);
    
    // Log filter options if present
    if (data?.filterOptions) {
      console.log('Filter options counts:', {
        brands: data.filterOptions.brands?.size,
        processors: data.filterOptions.processors?.size,
        ramSizes: data.filterOptions.ramSizes?.size,
        storage: data.filterOptions.storageOptions?.size,
        graphics: data.filterOptions.graphicsCards?.size,
        screenSizes: data.filterOptions.screenSizes?.size
      });
    }
    
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
  cache.clear('filter-options-only');
};

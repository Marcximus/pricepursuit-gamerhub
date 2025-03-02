
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";
import { cache } from "@/lib/cache";

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
  fetchAllOptions?: boolean; // Parameter to fetch filter options from entire DB
}

/**
 * Fetches laptops with optimized performance using serverless function
 * Now with client-side caching for better performance and separate filter options query
 * Multiple fallback mechanisms for resilience
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
  includeFilterOptions = false,
  fetchAllOptions = false // New parameter to fetch all filter options
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
    
    // Add flag to request filter options from entire DB
    if (fetchAllOptions) {
      params.append('fetchAllOptions', 'true');
    }
    
    // Special case for filter options only query
    if (fetchAllOptions || pageSize === 1) {
      const cacheKey = 'filter-options-only';
      const cachedOptions = cache.get<PaginatedResponse<Product>>(cacheKey);
      if (cachedOptions) {
        console.log('Using cached ALL filter options');
        return cachedOptions;
      }
      
      console.log('Fetching ALL filter options from database');
      
      try {
        // Special request for ALL filter options
        const { data: filterOptionsData, error } = await supabase.functions.invoke('fetch-laptops', {
          method: 'POST',
          body: { 
            query: { 
              includeFilterOptions: true, 
              fetchAllOptions: true,
              pageSize: 1, 
              page: 1 
            },
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
        
        // Cache filter options for a longer time (60 minutes)
        cache.set(cacheKey, filterOptionsData, { expiry: 60 * 60 * 1000 });
        
        return filterOptionsData as PaginatedResponse<Product>;
      } catch (error) {
        console.error('Error fetching filter options:', error);
        
        // Fallback to direct database query for filter options
        console.log('Falling back to direct fetch for filter options');
        
        try {
          // Directly query database for distinct filter values
          const filterOptions = await fetchFilterOptionsDirectly();
          
          const response = {
            data: [],
            meta: {
              totalCount: 0,
              page: 1,
              pageSize: 1,
              totalPages: 1
            },
            filterOptions
          };
          
          // Cache the direct fetch result
          cache.set(cacheKey, response, { expiry: 60 * 60 * 1000 });
          
          return response;
        } catch (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
          
          // Return empty filter options as last resort
          return {
            data: [],
            meta: {
              totalCount: 0,
              page: 1,
              pageSize: 1,
              totalPages: 1
            },
            filterOptions: {
              brands: new Set<string>(),
              processors: new Set<string>(),
              ramSizes: new Set<string>(),
              storageOptions: new Set<string>(),
              graphicsCards: new Set<string>(),
              screenSizes: new Set<string>()
            }
          };
        }
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

  try {
    // Check if we have a cached version first
    const cacheKey = `fetch-laptops-${queryString}`;
    const cachedData = cache.get<PaginatedResponse<Product>>(cacheKey);
    if (cachedData) {
      console.log('Using cached laptop data');
      return cachedData;
    }
    
    // Try invoking the serverless function with POST method
    try {
      const { data, error } = await supabase.functions.invoke('fetch-laptops', {
        method: 'POST',
        body: { 
          query: Object.fromEntries(params),
          includeFilterOptions,
          fetchAllOptions
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Error invoking function with POST:', error);
        throw error;
      }

      // If the data includes filter options, convert arrays to Sets
      if (data?.filterOptions) {
        Object.keys(data.filterOptions).forEach(key => {
          data.filterOptions[key] = new Set(data.filterOptions[key]);
        });
      }

      // Cache the result for future use
      cache.set(cacheKey, data, { expiry: cacheTime });
      
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
      console.error('POST method failed, trying GET fallback:', error);
      
      // Fallback to GET if POST fails
      // Get access token for the request
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || '';
      
      // Try GET with the actual Supabase URL as a fallback
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
      
      // Cache the result for future use
      cache.set(cacheKey, data, { expiry: cacheTime });
      
      return data as PaginatedResponse<Product>;
    }
  } catch (error) {
    console.error('Error fetching optimized laptops:', error);
    
    // Try to get from cache even if the request failed
    const cachedData = cache.get<PaginatedResponse<Product>>(`fetch-laptops-${queryString}`);
    if (cachedData) {
      console.log('Using cached data due to request failure');
      return cachedData;
    }
    
    // Last resort fallback - direct database query
    console.log('All API methods failed, falling back to direct database query');
    try {
      const laptops = await fetchLaptopsDirectly({
        page,
        pageSize,
        sortBy,
        sortDir,
        filters: {
          brand,
          minPrice,
          maxPrice,
          ram,
          processor,
          storage,
          graphics,
          screenSize
        }
      });
      
      const result = {
        data: laptops.data,
        meta: {
          totalCount: laptops.totalCount,
          page: page,
          pageSize: pageSize,
          totalPages: Math.ceil(laptops.totalCount / pageSize)
        }
      };
      
      // Add filter options if requested
      if (includeFilterOptions) {
        const filterOptions = await fetchFilterOptionsDirectly();
        result['filterOptions'] = filterOptions;
      }
      
      return result as PaginatedResponse<Product>;
    } catch (fallbackError) {
      console.error('Direct database query also failed:', fallbackError);
      throw error;
    }
  }
}

/**
 * Function to clear product cache on specific actions
 */
export const clearLaptopCache = () => {
  cache.clear('fetch-laptops-');
  cache.clear('filter-options-only');
};

/**
 * Direct database query for filter options as a fallback
 */
async function fetchFilterOptionsDirectly() {
  console.log('Fetching filter options directly from database');
  
  // Get brands
  const { data: brands } = await supabase
    .from('products')
    .select('brand')
    .eq('is_laptop', true)
    .not('brand', 'is', null);
  
  // Get processors
  const { data: processors } = await supabase
    .from('products')
    .select('processor')
    .eq('is_laptop', true)
    .not('processor', 'is', null);
  
  // Get RAM sizes
  const { data: ramSizes } = await supabase
    .from('products')
    .select('ram')
    .eq('is_laptop', true)
    .not('ram', 'is', null);
  
  // Get storage options
  const { data: storageOptions } = await supabase
    .from('products')
    .select('storage')
    .eq('is_laptop', true)
    .not('storage', 'is', null);
  
  // Get graphics cards
  const { data: graphicsCards } = await supabase
    .from('products')
    .select('graphics')
    .eq('is_laptop', true)
    .not('graphics', 'is', null);
  
  // Get screen sizes
  const { data: screenSizes } = await supabase
    .from('products')
    .select('screen_size')
    .eq('is_laptop', true)
    .not('screen_size', 'is', null);
  
  return {
    brands: new Set(brands?.map(item => item.brand) || []),
    processors: new Set(processors?.map(item => item.processor) || []),
    ramSizes: new Set(ramSizes?.map(item => item.ram) || []),
    storageOptions: new Set(storageOptions?.map(item => item.storage) || []),
    graphicsCards: new Set(graphicsCards?.map(item => item.graphics) || []),
    screenSizes: new Set(screenSizes?.map(item => item.screen_size) || [])
  };
}

/**
 * Direct database query for laptops as a fallback
 */
async function fetchLaptopsDirectly({ page, pageSize, sortBy, sortDir, filters }) {
  console.log('Fetching laptops directly from database');
  
  let query = supabase
    .from('products')
    .select(`
      *,
      product_reviews (
        id, rating, title, content, reviewer_name, review_date, verified_purchase, helpful_votes
      )
    `, { count: 'exact' })
    .eq('is_laptop', true);
  
  // Apply filters
  if (filters.brand) {
    query = query.in('brand', filters.brand.split(','));
  }
  
  if (filters.minPrice) {
    query = query.gte('current_price', filters.minPrice);
  }
  
  if (filters.maxPrice) {
    query = query.lte('current_price', filters.maxPrice);
  }
  
  // Add pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Add sorting
  const sortField = sortBy === 'price' ? 'current_price' : sortBy;
  query = query.order(sortField, { ascending: sortDir === 'asc' });
  
  // Execute query with pagination
  const { data, count, error } = await query.range(from, to);
  
  if (error) {
    console.error('Error in direct database query:', error);
    throw error;
  }
  
  return {
    data: data || [],
    totalCount: count || 0
  };
}

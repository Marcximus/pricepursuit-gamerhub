
import { useQuery } from "@tanstack/react-query";
import { processAndFilterLaptops } from "@/services/laptopProcessingService";
import { fetchAllLaptops } from "@/services/laptopService";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { collectLaptops } from "@/utils/laptop/collectLaptops";
import { updateLaptops } from "@/utils/laptop/updateLaptops";
import { refreshBrandModels } from "@/utils/laptop/refreshBrandModels";
import { processLaptopsAI } from "@/utils/laptop/processLaptopsAI";
import { getDatabaseStats } from "@/utils/laptop/getDatabaseStats";
import { fetchOptimizedLaptops, clearLaptopCache } from "@/utils/laptop/fetchOptimizedLaptops";
import { cache } from "@/lib/cache";

export { 
  collectLaptops, 
  updateLaptops, 
  refreshBrandModels, 
  processLaptopsAI,
  getDatabaseStats,
  clearLaptopCache
};

export const ITEMS_PER_PAGE = 30;

const defaultFilters: FilterOptions = {
  priceRange: { min: 0, max: 10000 },
  processors: new Set<string>(),
  ramSizes: new Set<string>(),
  storageOptions: new Set<string>(),
  graphicsCards: new Set<string>(),
  screenSizes: new Set<string>(),
  brands: new Set<string>()
};

// Define an interface for the filter options structure
interface FilterOptionsData {
  brands: Set<string>;
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
}

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions = defaultFilters
) => {
  const apiFilters = {
    brand: Array.from(filters.brands || []).join(',') || undefined,
    minPrice: filters.priceRange.min > 0 ? filters.priceRange.min : undefined,
    maxPrice: filters.priceRange.max < 10000 ? filters.priceRange.max : undefined,
    ram: Array.from(filters.ramSizes || []).join(',') || undefined,
    processor: Array.from(filters.processors || []).join(',') || undefined,
    storage: Array.from(filters.storageOptions || []).join(',') || undefined,
    graphics: Array.from(filters.graphicsCards || []).join(',') || undefined,
    screenSize: Array.from(filters.screenSizes || []).join(',') || undefined
  };

  console.log('API Filters for laptop query:', apiFilters);

  const [sortField, sortDirection] = sortBy.split('-') as [string, 'asc' | 'desc'];
  
  // Fetch ALL filter options from the entire database using a direct Supabase query
  // This ensures we get all possible filter values regardless of pagination or current filters
  const filterOptionsQuery = useQuery({
    queryKey: ['all-filter-options'],
    queryFn: async () => {
      try {
        // First try to get from optimized endpoint
        const data = await fetchOptimizedLaptops({
          includeFilterOptions: true,
          page: 1,
          pageSize: 1,
          fetchAllOptions: true
        });
        
        if (data?.filterOptions) return data;
        
        // If that fails, fallback to direct database fetch
        console.log('Falling back to direct database fetch for filter options');
        const laptopData = await fetchAllLaptops();
        
        // If we get an array of laptops, we need to convert it to the expected format
        if (Array.isArray(laptopData)) {
          return {
            data: [],
            meta: { totalCount: 0, totalPages: 0, page: 1, pageSize: 1 },
            filterOptions: createFilterOptionsFromLaptops(laptopData)
          };
        }
        
        return laptopData;
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Fallback to direct database fetch on error
        try {
          const laptopData = await fetchAllLaptops();
          
          // If we get an array of laptops, we need to convert it to the expected format
          if (Array.isArray(laptopData)) {
            return {
              data: [],
              meta: { totalCount: 0, totalPages: 0, page: 1, pageSize: 1 },
              filterOptions: createFilterOptionsFromLaptops(laptopData)
            };
          }
          
          return laptopData;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          return {
            data: [],
            meta: { totalCount: 0, totalPages: 0, page: 1, pageSize: 1 },
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
    },
    staleTime: 1000 * 60 * 60, // 60 minutes - long cache time
    gcTime: 1000 * 60 * 120, // 2 hours
    retry: 2, // Retry failed requests twice
  });

  // Main query for filtered/paginated data
  const query = useQuery({
    queryKey: ['optimized-laptops', { page, sortBy, filters: JSON.stringify(apiFilters) }],
    queryFn: async () => {
      try {
        // First try using the optimized function
        return await fetchOptimizedLaptops({
          ...apiFilters,
          sortBy: sortField,
          sortDir: sortDirection,
          page,
          pageSize: ITEMS_PER_PAGE,
          includeFilterOptions: false
        });
      } catch (error) {
        console.error('Error using optimized fetch, falling back to direct fetch:', error);
        // Fallback to fetching directly from database if the function fails
        const allLaptops = await fetchAllLaptops();
        
        // Make sure we have the expected structure for the response
        if (Array.isArray(allLaptops)) {
          // Format response to match the expected structure
          return {
            data: allLaptops,
            meta: {
              totalCount: allLaptops.length,
              totalPages: Math.ceil(allLaptops.length / ITEMS_PER_PAGE),
              page: page,
              pageSize: ITEMS_PER_PAGE
            }
          };
        } else {
          throw new Error('Invalid response from fetchAllLaptops');
        }
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
    retry: 1, // Retry failed requests once
  });

  // Helper function to create filter options from an array of laptops
  function createFilterOptionsFromLaptops(laptops: any[]): FilterOptionsData {
    const options: FilterOptionsData = {
      brands: new Set<string>(),
      processors: new Set<string>(),
      ramSizes: new Set<string>(),
      storageOptions: new Set<string>(),
      graphicsCards: new Set<string>(),
      screenSizes: new Set<string>()
    };
    
    laptops.forEach(laptop => {
      if (laptop.brand) options.brands.add(laptop.brand);
      if (laptop.processor) options.processors.add(laptop.processor);
      if (laptop.ram) options.ramSizes.add(laptop.ram);
      if (laptop.storage) options.storageOptions.add(laptop.storage);
      if (laptop.graphics) options.graphicsCards.add(laptop.graphics);
      if (laptop.screen_size) options.screenSizes.add(laptop.screen_size);
    });
    
    return options;
  }

  // Get filterOptions from the filterOptionsQuery if available
  const filterOptions = filterOptionsQuery.data?.filterOptions as FilterOptionsData | undefined;

  const transformedData = query.data ? {
    laptops: query.data.data || [],
    totalCount: query.data.meta.totalCount || 0,
    totalPages: query.data.meta.totalPages || 1,
    allLaptops: query.data.data || [],
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI,
    getDatabaseStats,
    clearLaptopCache,
    filterOptions: filterOptions || {
      brands: new Set<string>(),
      processors: new Set<string>(),
      ramSizes: new Set<string>(),
      storageOptions: new Set<string>(),
      graphicsCards: new Set<string>(),
      screenSizes: new Set<string>()
    }
  } : null;

  return {
    ...query,
    filterOptionsLoading: filterOptionsQuery.isLoading || filterOptionsQuery.isFetching,
    filterOptionsError: filterOptionsQuery.error,
    data: transformedData,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI,
    getDatabaseStats,
    clearLaptopCache,
    filterOptions
  };
};

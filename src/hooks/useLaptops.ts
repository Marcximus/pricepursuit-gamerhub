import { useQuery, useQueryClient } from "@tanstack/react-query";
import { processAndFilterLaptops } from "@/services/laptopProcessingService";
import { fetchAllLaptops, fetchInitialLaptops } from "@/services/laptopService";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { collectLaptops } from "@/utils/laptop/collectLaptops";
import { updateLaptops } from "@/utils/laptop/updateLaptops";
import { refreshBrandModels } from "@/utils/laptop/refreshBrandModels";
import { processLaptopsAI } from "@/utils/laptop/processLaptopsAI";
import { getDatabaseStats } from "@/utils/laptop/getDatabaseStats";
import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

export { 
  collectLaptops, 
  updateLaptops, 
  refreshBrandModels, 
  processLaptopsAI,
  getDatabaseStats
};

export const ITEMS_PER_PAGE = 50;

const defaultFilters: FilterOptions = {
  priceRange: { min: 0, max: 10000 },
  processors: new Set<string>(),
  ramSizes: new Set<string>(),
  storageOptions: new Set<string>(),
  graphicsCards: new Set<string>(),
  screenSizes: new Set<string>(),
  brands: new Set<string>()
};

// Cache for laptop data to avoid redundant processing
let cachedLaptops: any[] | null = null;
let cachedProcessedLaptops: any[] | null = null;
let cachedFilterResults: Map<string, any> = new Map();

// Generate a cache key from filters and sort
function generateCacheKey(sortBy: SortOption, filters: FilterOptions, page: number): string {
  const filterKey = JSON.stringify({
    priceRange: filters.priceRange,
    processors: Array.from(filters.processors),
    ramSizes: Array.from(filters.ramSizes),
    storageOptions: Array.from(filters.storageOptions),
    graphicsCards: Array.from(filters.graphicsCards),
    screenSizes: Array.from(filters.screenSizes),
    brands: Array.from(filters.brands)
  });
  
  return `${sortBy}|${filterKey}|${page}`;
}

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions = defaultFilters
) => {
  const queryClient = useQueryClient();
  const fullDataLoadedRef = useRef(false);
  const backgroundLoadingRef = useRef(false);
  const cacheKey = generateCacheKey(sortBy, filters, page);
  
  // Initial fast query to show something immediately
  const initialQuery = useQuery({
    queryKey: ['initial-laptops'],
    queryFn: fetchInitialLaptops,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
  
  // Full data query that runs in the background
  const fullQuery = useQuery({
    queryKey: ['all-laptops'],
    queryFn: fetchAllLaptops,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: false, // Don't run automatically
    select: (data) => {
      // Use cached data if available to avoid reprocessing
      if (cachedLaptops !== data) {
        cachedLaptops = data;
        cachedProcessedLaptops = null; // Reset processed cache when raw data changes
        cachedFilterResults.clear(); // Clear filter results cache
      }
      
      // Check if we have cached results for this filter/sort/page combination
      if (cachedFilterResults.has(cacheKey)) {
        return cachedFilterResults.get(cacheKey);
      }
      
      const processedData = processAndFilterLaptops(
        data, 
        filters, 
        sortBy, 
        page, 
        ITEMS_PER_PAGE, 
        cachedProcessedLaptops
      );
      
      // Store processed laptops for reuse
      if (!cachedProcessedLaptops) {
        cachedProcessedLaptops = processedData.allLaptops;
      }
      
      // Cache the results for this filter/sort/page combination
      const result = {
        ...processedData,
        collectLaptops,
        updateLaptops,
        refreshBrandModels,
        processLaptopsAI,
        getDatabaseStats
      };
      
      cachedFilterResults.set(cacheKey, result);
      
      return result;
    },
  });
  
  // Start background loading when component mounts
  useEffect(() => {
    if (!backgroundLoadingRef.current) {
      backgroundLoadingRef.current = true;
      queryClient.fetchQuery({
        queryKey: ['all-laptops'],
      }).then(() => {
        fullDataLoadedRef.current = true;
        // Silently update the UI with the full results once loaded
        queryClient.invalidateQueries({ queryKey: ['processed-laptops'] });
      }).catch(error => {
        console.error('Error loading full laptop data:', error);
        toast({
          title: "Error loading complete catalog",
          description: "Some laptops may not be visible. Try refreshing the page.",
          variant: "destructive",
        });
      });
    }
  }, [queryClient]);
  
  // Combine initial and full data for the best user experience
  const processedQuery = useQuery({
    queryKey: ['processed-laptops', sortBy, JSON.stringify(filters), page],
    enabled: initialQuery.isSuccess,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    queryFn: async () => {
      // If we have full data, use it with filters
      if (fullDataLoadedRef.current && fullQuery.data) {
        return fullQuery.data;
      }
      
      // Otherwise use initial data with filters
      if (initialQuery.data) {
        // Check if we have cached results for this filter/sort/page combination
        if (cachedFilterResults.has(cacheKey)) {
          return cachedFilterResults.get(cacheKey);
        }
        
        const processedData = processAndFilterLaptops(
          initialQuery.data, 
          filters, 
          sortBy, 
          page, 
          ITEMS_PER_PAGE
        );
        
        const result = {
          ...processedData,
          collectLaptops,
          updateLaptops,
          refreshBrandModels,
          processLaptopsAI,
          getDatabaseStats,
          isPartialData: true // Flag to indicate this is not the full dataset
        };
        
        cachedFilterResults.set(cacheKey, result);
        return result;
      }
      
      throw new Error('No data available');
    }
  });

  return {
    ...processedQuery,
    isInitialLoading: initialQuery.isLoading,
    isFullDataLoaded: fullDataLoadedRef.current,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI,
    getDatabaseStats
  };
};

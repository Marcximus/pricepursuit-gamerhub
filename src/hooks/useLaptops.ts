
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

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions = defaultFilters
) => {
  const query = useQuery({
    queryKey: ['all-laptops'],
    queryFn: fetchAllLaptops,
    staleTime: Infinity, // Never consider cached data stale (we'll handle expiry ourselves)
    gcTime: Infinity, // Never garbage collect this query
    // Immediately use embedded data if available
    initialData: () => {
      try {
        // First check for embedded data in window object
        if (window.EMBEDDED_LAPTOP_DATA && 
            Array.isArray(window.EMBEDDED_LAPTOP_DATA) && 
            window.EMBEDDED_LAPTOP_DATA.length > 0) {
          console.log(`Using ${window.EMBEDDED_LAPTOP_DATA.length} laptops from embedded data as initialData`);
          return window.EMBEDDED_LAPTOP_DATA;
        }
        
        // Fall back to localStorage cache
        const cacheExpiryStr = localStorage.getItem('preloaded-laptops-expiry');
        const cachedDataStr = localStorage.getItem('preloaded-laptops-data');
        if (cacheExpiryStr && cachedDataStr) {
          const expiry = parseInt(cacheExpiryStr, 10);
          if (Date.now() <= expiry) {
            const cachedData = JSON.parse(cachedDataStr);
            console.log(`Using ${cachedData.length} laptops from localStorage as initialData`);
            return cachedData;
          }
        }
      } catch (err) {
        console.error('Error accessing initial data sources:', err);
      }
      return undefined;
    },
    select: (data) => {
      const processedData = processAndFilterLaptops(data, filters, sortBy, page, ITEMS_PER_PAGE);
      return {
        ...processedData,
        collectLaptops,
        updateLaptops,
        refreshBrandModels,
        processLaptopsAI,
        getDatabaseStats
      };
    },
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI,
    getDatabaseStats
  };
};

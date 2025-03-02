
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
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
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
    // Add initial data placeholder for better UX
    placeholderData: {
      laptops: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      filterOptions: {
        processors: new Set(),
        ramSizes: new Set(),
        storageOptions: new Set(),
        graphicsCards: new Set(),
        screenSizes: new Set(),
        brands: new Set(),
      },
      optionsWithCounts: {
        processors: [],
        ramSizes: [],
        storageOptions: [],
        graphicsCards: [],
        screenSizes: [],
        brands: [],
      },
      collectLaptops,
      updateLaptops,
      refreshBrandModels,
      processLaptopsAI,
      getDatabaseStats
    }
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


import { useQuery } from "@tanstack/react-query";
import { processAndFilterLaptops } from "@/services/laptopProcessingService";
import { fetchAllLaptops, fetchPaginatedLaptops } from "@/services/laptopService";
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

// Check if any filters are active
const hasActiveFilters = (filters: FilterOptions): boolean => {
  return (
    filters.priceRange.min !== defaultFilters.priceRange.min ||
    filters.priceRange.max !== defaultFilters.priceRange.max ||
    filters.processors.size > 0 ||
    filters.ramSizes.size > 0 ||
    filters.storageOptions.size > 0 ||
    filters.graphicsCards.size > 0 ||
    filters.screenSizes.size > 0 ||
    filters.brands.size > 0
  );
};

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions = defaultFilters
) => {
  // If we don't have any active filters, use direct pagination for better performance
  const useDirectPagination = !hasActiveFilters(filters);

  // Query for paginated data (when no filters are applied)
  const paginatedQuery = useQuery({
    queryKey: ['paginated-laptops', page, sortBy],
    queryFn: () => fetchPaginatedLaptops(page, ITEMS_PER_PAGE, sortBy),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: useDirectPagination, // Only run this query if no filters are active
  });

  // Query for all laptops (when filters are applied)
  const allLaptopsQuery = useQuery({
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
    enabled: !useDirectPagination, // Only run this query if filters are active
  });

  // Return the appropriate query result based on which one is active
  const activeQuery = useDirectPagination ? paginatedQuery : allLaptopsQuery;

  return {
    ...activeQuery,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI,
    getDatabaseStats
  };
};

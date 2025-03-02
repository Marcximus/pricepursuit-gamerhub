
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

  // Query to get filter options - this is kept separate from pagination
  // to allow fast loading of initial page while filters load in the background
  const filterOptionsQuery = useQuery({
    queryKey: ['laptop-filter-options'],
    queryFn: async () => {
      // Fetch just enough data to generate filter options
      const filterData = await fetchAllLaptops(true); // Pass true to get minimal data for filters
      return filterData;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });

  // Query for paginated data (when no filters are applied)
  const paginatedQuery = useQuery({
    queryKey: ['paginated-laptops', page, sortBy],
    queryFn: async () => {
      const result = await fetchPaginatedLaptops(page, ITEMS_PER_PAGE, sortBy);
      // Return a consistent data structure with both queries
      return {
        ...result,
        // For filter generation, use either the filter-specific data or the current page data
        allLaptops: filterOptionsQuery.data || result.laptops || []
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: useDirectPagination, // Only run this query if no filters are active
  });

  // Query for all laptops (when filters are applied)
  const allLaptopsQuery = useQuery({
    queryKey: ['all-laptops', filters],
    queryFn: async () => {
      const allLaptops = filterOptionsQuery.data || await fetchAllLaptops();
      const processedData = processAndFilterLaptops(allLaptops, filters, sortBy, page, ITEMS_PER_PAGE);
      return processedData;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !useDirectPagination, // Only run this query if filters are active
  });

  // Return the appropriate query result based on which one is active
  const activeQuery = useDirectPagination ? paginatedQuery : allLaptopsQuery;
  const isLoading = activeQuery.isLoading || filterOptionsQuery.isLoading;

  return {
    ...activeQuery,
    // Add the filter options data to ensure it's always available
    filterOptionsData: filterOptionsQuery.data,
    isFilterOptionsLoading: filterOptionsQuery.isLoading,
    isLoading, // Combined loading state
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI,
    getDatabaseStats
  };
};

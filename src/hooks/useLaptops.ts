
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

export const ITEMS_PER_PAGE = 500;

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
  
  // Use a separate query to fetch ALL filter options (not paginated)
  const filterOptionsQuery = useQuery({
    queryKey: ['filter-options'],
    queryFn: () => fetchOptimizedLaptops({
      // No filters here - we want ALL possible options
      includeFilterOptions: true,
      page: 1,
      pageSize: 1 // We only need the filter options, not the actual data
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Main query for filtered/paginated data
  const query = useQuery({
    queryKey: ['optimized-laptops', { page, sortBy, filters: JSON.stringify(apiFilters) }],
    queryFn: () => fetchOptimizedLaptops({
      ...apiFilters,
      sortBy: sortField,
      sortDir: sortDirection,
      page,
      pageSize: ITEMS_PER_PAGE
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get filter options from the dedicated query if available, otherwise from the main query
  const filterOptions = filterOptionsQuery.data?.filterOptions || query.data?.filterOptions;

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
    filterOptionsLoading: filterOptionsQuery.isLoading,
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


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
  
  // Completely separate query just for filter options - independent of pagination or filters
  // This ensures we always have ALL filter options from the entire database
  const filterOptionsQuery = useQuery({
    queryKey: ['all-filter-options'],
    queryFn: () => fetchOptimizedLaptops({
      // No filters - we want ALL possible options from the entire database
      includeFilterOptions: true,
      page: 1,
      pageSize: 1 // We only need the filter options, not the actual data
    }),
    staleTime: 1000 * 60 * 30, // 30 minutes - longer cache for filter options
    gcTime: 1000 * 60 * 60, // 60 minutes
  });

  // Main query for filtered/paginated data
  const query = useQuery({
    queryKey: ['optimized-laptops', { page, sortBy, filters: JSON.stringify(apiFilters) }],
    queryFn: () => fetchOptimizedLaptops({
      ...apiFilters,
      sortBy: sortField,
      sortDir: sortDirection,
      page,
      pageSize: ITEMS_PER_PAGE,
      // Don't need filter options in this query since we have a separate query for that
      includeFilterOptions: false
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Always use the dedicated filter options query for filters, never fall back to the main query
  const filterOptions = filterOptionsQuery.data?.filterOptions;

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

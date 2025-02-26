
import { useQuery } from "@tanstack/react-query";
import { processLaptopData } from "@/utils/laptopUtils";
import { filterLaptops } from "@/utils/laptopFilters";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import { collectLaptops } from "@/utils/laptop/collectLaptops";
import { updateLaptops } from "@/utils/laptop/updateLaptops";
import { refreshBrandModels } from "@/utils/laptop/refreshBrandModels";
import { processLaptopsAI } from "@/utils/laptop/processLaptopsAI";
import { fetchAllLaptops } from "@/services/laptopService";
import { logDataStatistics, analyzeFilteredResults } from "@/services/laptopAnalytics";
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export { collectLaptops, updateLaptops, refreshBrandModels, processLaptopsAI };

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
      console.log('Processing query results with:', {
        filtersApplied: {
          priceRange: filters.priceRange,
          processorCount: filters.processors.size,
          ramCount: filters.ramSizes.size,
          storageCount: filters.storageOptions.size,
          graphicsCount: filters.graphicsCards.size,
          screenSizeCount: filters.screenSizes.size,
          brandCount: filters.brands.size
        },
        sortBy,
        page
      });
      
      const processedLaptops = data.map(laptop => {
        const reviews = laptop.product_reviews || [];
        const reviewData = {
          rating_breakdown: {},
          recent_reviews: reviews.map(review => ({
            rating: review.rating,
            title: review.title || '',
            content: review.content || '',
            reviewer_name: review.reviewer_name || 'Anonymous',
            review_date: review.review_date,
            verified_purchase: review.verified_purchase || false,
            helpful_votes: review.helpful_votes || 0
          }))
        };
        return processLaptopData(laptop);
      });

      logDataStatistics(processedLaptops);
      
      // Apply filters, sort, and pagination
      const filteredLaptops = filterLaptops(processedLaptops, filters);
      analyzeFilteredResults(processedLaptops, filteredLaptops, filters, sortBy);
      
      const sortedLaptops = sortLaptops(filteredLaptops, sortBy);
      const paginatedResults = paginateLaptops(sortedLaptops, page, ITEMS_PER_PAGE);

      console.log('Filter/sort/pagination results:', {
        totalLaptops: processedLaptops.length,
        afterFiltering: filteredLaptops.length, 
        afterSorting: sortedLaptops.length,
        currentPage: page,
        laptopsOnPage: paginatedResults.laptops.length,
      });

      return {
        ...paginatedResults,
        allLaptops: processedLaptops,
        collectLaptops,
        updateLaptops,
        refreshBrandModels,
        processLaptopsAI
      };
    },
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    processLaptopsAI
  };
};

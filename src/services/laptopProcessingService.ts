
import type { Product } from "@/types/product";
import { processLaptopData } from "@/utils/laptopUtils";
import { logDataStatistics, analyzeFilteredResults } from "@/services/laptopAnalytics";
import { filterLaptops } from "@/utils/laptop/filter";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { normalizeBrand, normalizeModel, normalizeStorage } from "@/utils/laptop/valueNormalizer";
import { applyAllProductFilters } from "@/utils/laptop/productFilters";

export const processAndFilterLaptops = (
  rawData: any[],
  filters: FilterOptions,
  sortBy: SortOption,
  page: number,
  itemsPerPage: number
) => {
  console.log('Processing laptop data batch:', {
    rawDataCount: rawData.length,
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

  // First apply product filtering to remove forbidden keywords and duplicate ASINs
  const filteredRawData = applyAllProductFilters(rawData);
  
  console.log(`Filtered out ${rawData.length - filteredRawData.length} products based on keywords, unrealistic storage, and duplicate ASINs`);
  
  // Process filtered laptop data
  const processedLaptops = filteredRawData.map(laptop => {
    // Normalize brand and model before processing
    const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
    const normalizedModel = normalizeModel(laptop.model || '', laptop.title, normalizedBrand);
    const normalizedStorage = normalizeStorage(laptop.storage || '');
    
    // Apply the normalized values
    const laptopWithNormalizedValues = {
      ...laptop,
      brand: normalizedBrand,
      model: normalizedModel,
      storage: normalizedStorage
    };
    
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
    return processLaptopData(laptopWithNormalizedValues);
  });

  // Log some info about storage values in the processed laptops
  const storageValues = processedLaptops
    .filter(laptop => laptop.storage)
    .map(laptop => laptop.storage);
  
  console.log(`Storage values found (sample of up to 10):`, 
    storageValues.slice(0, 10), 
    `Total unique values: ${new Set(storageValues).size}`
  );

  logDataStatistics(processedLaptops);

  // Apply filters and sorting
  const filteredLaptops = filterLaptops(processedLaptops, filters);
  analyzeFilteredResults(processedLaptops, filteredLaptops, filters, sortBy);

  const sortedLaptops = sortLaptops(filteredLaptops, sortBy);
  const paginatedResults = paginateLaptops(sortedLaptops, page, itemsPerPage);

  console.log('Filter/sort/pagination results:', {
    totalLaptops: processedLaptops.length,
    afterFiltering: filteredLaptops.length,
    afterSorting: sortedLaptops.length,
    currentPage: page,
    laptopsOnPage: paginatedResults.laptops.length,
  });

  return {
    ...paginatedResults,
    allLaptops: processedLaptops
  };
};

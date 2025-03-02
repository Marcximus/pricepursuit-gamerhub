
import type { Product } from "@/types/product";
import { processLaptopData } from "@/utils/laptopUtils";
import { logDataStatistics, analyzeFilteredResults } from "@/services/laptopAnalytics";
import { filterLaptops } from "@/utils/laptop/filter";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { normalizeBrand, normalizeModel } from "@/utils/laptop/valueNormalizer";
import { applyAllProductFilters } from "@/utils/laptop/productFilters";
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";

// Cache for processed laptops to avoid redundant processing
const processedLaptopsCache = new Map<string, Product>();

export const processAndFilterLaptops = (
  rawData: any[],
  filters: FilterOptions,
  sortBy: SortOption,
  page: number,
  itemsPerPage: number,
  cachedProcessedLaptops: Product[] | null = null
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
    page,
    usingCache: !!cachedProcessedLaptops
  });

  // Use cached processed laptops if available
  let processedLaptops: Product[];
  
  if (cachedProcessedLaptops) {
    console.log('Using cached processed laptops, count:', cachedProcessedLaptops.length);
    processedLaptops = cachedProcessedLaptops;
  } else {
    // First apply product filtering to remove forbidden keywords and duplicate ASINs
    const filteredRawData = applyAllProductFilters(rawData);
    
    console.log(`Filtered out ${rawData.length - filteredRawData.length} products based on keywords and duplicate ASINs`);
    
    // Process filtered laptop data
    processedLaptops = filteredRawData.map(laptop => {
      // Check if we already processed this laptop
      const cacheKey = laptop.id;
      if (processedLaptopsCache.has(cacheKey)) {
        return processedLaptopsCache.get(cacheKey)!;
      }
      
      // Normalize brand and model before processing
      const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
      const normalizedModel = normalizeModel(laptop.model || '', laptop.title, normalizedBrand);
      
      // Extract processor from title first, fall back to database value
      // This prioritizes title-based processor information
      const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
      
      // Apply the normalized values
      const laptopWithNormalizedValues = {
        ...laptop,
        brand: normalizedBrand,
        model: normalizedModel,
        processor: extractedProcessor || laptop.processor // Use extracted processor if available
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
      
      const processedLaptop = processLaptopData(laptopWithNormalizedValues);
      
      // Cache the processed laptop
      processedLaptopsCache.set(cacheKey, processedLaptop);
      
      return processedLaptop;
    });
  }

  // Log statistics less frequently for performance
  if (!cachedProcessedLaptops) {
    logDataStatistics(processedLaptops);
  }

  // Apply filters and sorting
  const filteredLaptops = filterLaptops(processedLaptops, filters);
  
  // Skip analytics in production for better performance
  if (process.env.NODE_ENV !== 'production') {
    analyzeFilteredResults(processedLaptops, filteredLaptops, filters, sortBy);
  }

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

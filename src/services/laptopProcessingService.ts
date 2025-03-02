
import type { Product } from "@/types/product";
import { processLaptopData } from "@/utils/laptopUtils";
import { logDataStatistics, analyzeFilteredResults } from "@/services/laptopAnalytics";
import { filterLaptops } from "@/utils/laptop/filter";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import type { SortOption } from "@/components/laptops/LaptopSort";
import { normalizeBrand, normalizeModel } from "@/utils/laptop/valueNormalizer";
import { applyAllProductFilters, containsForbiddenKeywords } from "@/utils/laptop/productFilters";
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";

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

  // First ensure no products with forbidden keywords are included
  // This is a safeguard in case the database cleanup wasn't run
  const noForbiddenKeywords = rawData.filter(product => 
    !containsForbiddenKeywords(product.title || '')
  );
  
  console.log(`Filtered out ${rawData.length - noForbiddenKeywords.length} products with forbidden keywords at processing time`);
  
  // Then apply product filtering to remove duplicate ASINs
  const filteredRawData = applyAllProductFilters(noForbiddenKeywords);
  
  console.log(`After all filtering: ${filteredRawData.length} products remain from original ${rawData.length}`);
  
  // Process filtered laptop data
  const processedLaptops = filteredRawData.map(laptop => {
    // Normalize brand and model before processing
    const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
    const normalizedModel = normalizeModel(laptop.model || '', laptop.title, normalizedBrand);
    
    // Extract processor from title first, fall back to database value
    // This prioritizes title-based processor information
    const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
    
    // Log when we're using title-based processor extraction for debugging
    if (extractedProcessor && extractedProcessor !== laptop.processor) {
      console.log(`Title-based processor extraction: "${laptop.title}" -> "${extractedProcessor}" (was: "${laptop.processor}")`);
    }
    
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
    return processLaptopData(laptopWithNormalizedValues);
  });

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

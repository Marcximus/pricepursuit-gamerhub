
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
import { processRam } from "@/utils/laptopUtils/processors/ramProcessor";
import { processGraphics } from "@/utils/laptopUtils/graphicsProcessor";
import { processStorage } from "@/utils/laptopUtils/processors/storageProcessor";
import { processScreenSize } from "@/utils/laptopUtils/physicalSpecsProcessor";
import { processScreenResolution } from "@/utils/laptopUtils/processors/screenProcessor";

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
  
  console.log(`Filtered out ${rawData.length - filteredRawData.length} products based on keywords and duplicate ASINs`);
  
  // Process filtered laptop data
  const processedLaptops = filteredRawData.map(laptop => {
    // Normalize brand and model before processing
    const normalizedBrand = normalizeBrand(laptop.brand || '', laptop.title);
    const normalizedModel = normalizeModel(laptop.model || '', laptop.title, normalizedBrand);
    
    // Extract processor from title first, fall back to database value
    const extractedProcessor = extractProcessorFromTitle(laptop.title, laptop.processor);
    
    // Extract other key specs from title if they're missing in the database
    const extractedRam = !laptop.ram ? processRam(undefined, laptop.title, laptop.description) : null;
    const extractedGraphics = !laptop.graphics ? processGraphics(undefined, laptop.title) : null;
    const extractedStorage = !laptop.storage ? processStorage(undefined, laptop.title, laptop.description) : null;
    const extractedScreenSize = !laptop.screen_size ? processScreenSize(undefined, laptop.title, laptop.description) : null;
    const extractedScreenResolution = !laptop.screen_resolution ? processScreenResolution(undefined, laptop.title, laptop.description) : null;
    
    // Log when we're using title-based extraction for debugging
    if (extractedProcessor && extractedProcessor !== laptop.processor) {
      console.log(`Title-based processor extraction: "${laptop.title}" -> "${extractedProcessor}" (was: "${laptop.processor}")`);
    }
    
    if (extractedRam || extractedGraphics || extractedStorage || extractedScreenSize || extractedScreenResolution) {
      console.log(`Additional title-based extractions for laptop "${laptop.title}":`, {
        ram: extractedRam || 'not extracted',
        graphics: extractedGraphics || 'not extracted',
        storage: extractedStorage || 'not extracted',
        screenSize: extractedScreenSize || 'not extracted',
        screenResolution: extractedScreenResolution || 'not extracted'
      });
    }
    
    // Apply the extracted values, prioritizing database values if they exist
    const laptopWithExtractedValues = {
      ...laptop,
      brand: normalizedBrand,
      model: normalizedModel,
      processor: extractedProcessor || laptop.processor,
      ram: laptop.ram || extractedRam,
      graphics: laptop.graphics || extractedGraphics,
      storage: laptop.storage || extractedStorage,
      screen_size: laptop.screen_size || extractedScreenSize,
      screen_resolution: laptop.screen_resolution || extractedScreenResolution
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
    return processLaptopData(laptopWithExtractedValues);
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


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processLaptopData } from "@/utils/laptopUtils";
import { filterLaptops } from "@/utils/laptopFilters";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import { collectLaptops } from "@/utils/laptop/collectLaptops";
import { updateLaptops } from "@/utils/laptop/updateLaptops";
import { refreshBrandModels } from "@/utils/laptop/refreshBrandModels";
import { processLaptopsAI } from "@/utils/laptop/processLaptopsAI";
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export { collectLaptops, updateLaptops, refreshBrandModels, processLaptopsAI };

export const ITEMS_PER_PAGE = 50;
const BATCH_SIZE = 1000;

const defaultFilters: FilterOptions = {
  priceRange: { min: 0, max: 10000 },
  processors: new Set<string>(),
  ramSizes: new Set<string>(),
  storageOptions: new Set<string>(),
  graphicsCards: new Set<string>(),
  screenSizes: new Set<string>(),
  brands: new Set<string>()
};

async function fetchAllLaptops() {
  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  console.log('Starting to fetch all laptops in batches...');

  while (hasMore) {
    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        current_price,
        original_price,
        rating,
        rating_count,
        image_url,
        processor,
        ram,
        storage,
        graphics,
        screen_size,
        screen_resolution,
        weight,
        processor_score,
        brand,
        model,
        asin,
        product_url,
        last_checked,
        created_at,
        wilson_score,
        product_reviews (
          id,
          rating,
          title,
          content,
          reviewer_name,
          review_date,
          verified_purchase,
          helpful_votes
        )
      `)
      .eq('is_laptop', true)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: laptops, error } = await query;

    if (error) {
      console.error('Error fetching laptops batch:', error);
      throw error;
    }

    if (!laptops || laptops.length === 0) {
      hasMore = false;
      break;
    }

    allLaptops = [...allLaptops, ...laptops];
    lastId = laptops[laptops.length - 1].id;

    if (laptops.length < BATCH_SIZE) {
      hasMore = false;
    }

    console.log(`Fetched batch of ${laptops.length} laptops, total so far: ${allLaptops.length}`);
  }

  console.log(`Completed fetching all laptops. Total count: ${allLaptops.length}`);
  
  // Log some statistics about our data
  const withPrice = allLaptops.filter(l => l.current_price !== null && l.current_price > 0).length;
  const withProcessor = allLaptops.filter(l => l.processor !== null && l.processor !== '').length;
  const withRAM = allLaptops.filter(l => l.ram !== null && l.ram !== '').length;
  const withStorage = allLaptops.filter(l => l.storage !== null && l.storage !== '').length;
  const withGraphics = allLaptops.filter(l => l.graphics !== null && l.graphics !== '').length;
  const withScreenSize = allLaptops.filter(l => l.screen_size !== null && l.screen_size !== '').length;
  
  console.log('Laptop data statistics:', {
    total: allLaptops.length,
    withPrice: `${withPrice} (${Math.round(withPrice/allLaptops.length*100)}%)`,
    withProcessor: `${withProcessor} (${Math.round(withProcessor/allLaptops.length*100)}%)`,
    withRAM: `${withRAM} (${Math.round(withRAM/allLaptops.length*100)}%)`,
    withStorage: `${withStorage} (${Math.round(withStorage/allLaptops.length*100)}%)`,
    withGraphics: `${withGraphics} (${Math.round(withGraphics/allLaptops.length*100)}%)`,
    withScreenSize: `${withScreenSize} (${Math.round(withScreenSize/allLaptops.length*100)}%)`
  });
  
  return allLaptops;
}

function analyzeFilteredResults(
  original: Product[], 
  filtered: Product[], 
  filters: FilterOptions,
  sortBy: SortOption
) {
  if (filtered.length === 0 && original.length > 0) {
    console.warn('No laptops matched the filters! Analyzing first few original items:');
    
    // Check why the first 3 laptops didn't match
    original.slice(0, 3).forEach(laptop => {
      console.log('Analyzing why this laptop was filtered out:', {
        id: laptop.id,
        title: laptop.title,
        price: laptop.current_price,
        brand: laptop.brand,
        processor: laptop.processor,
        ram: laptop.ram,
        storage: laptop.storage,
        graphics: laptop.graphics,
        screen_size: laptop.screen_size
      });
      
      // Check each filter
      if (filters.brands.size > 0) {
        console.log(`- Brand filter (${Array.from(filters.brands).join(', ')}): ${laptop.brand ? 'Has brand' : 'Missing brand'} - ${filters.brands.has(laptop.brand || '') ? 'MATCH' : 'NO MATCH'}`);
      }
      
      if (filters.processors.size > 0) {
        console.log(`- Processor filter (${Array.from(filters.processors).join(', ')}): ${laptop.processor || 'Missing'} - NO MATCH`);
      }
      
      if (filters.ramSizes.size > 0) {
        console.log(`- RAM filter (${Array.from(filters.ramSizes).join(', ')}): ${laptop.ram || 'Missing'} - NO MATCH`);
      }
      
      if (filters.storageOptions.size > 0) {
        console.log(`- Storage filter (${Array.from(filters.storageOptions).join(', ')}): ${laptop.storage || 'Missing'} - NO MATCH`);
      }
      
      if (filters.graphicsCards.size > 0) {
        console.log(`- Graphics filter (${Array.from(filters.graphicsCards).join(', ')}): ${laptop.graphics || 'Missing'} - NO MATCH`);
      }
      
      if (filters.screenSizes.size > 0) {
        console.log(`- Screen size filter (${Array.from(filters.screenSizes).join(', ')}): ${laptop.screen_size || 'Missing'} - NO MATCH`);
      }
      
      const price = laptop.current_price || 0;
      console.log(`- Price filter (${filters.priceRange.min}-${filters.priceRange.max}): ${price} - ${price >= filters.priceRange.min && price <= filters.priceRange.max ? 'MATCH' : 'NO MATCH'}`);
    });
  }
}

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

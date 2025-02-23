
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processLaptopData } from "@/utils/laptopUtils";
import { filterLaptops } from "@/utils/laptopFilters";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import { processLaptopsAI } from "@/utils/laptop/processLaptopsAI";
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export { collectLaptops, updateLaptops, refreshBrandModels, processLaptopsAI };

export const ITEMS_PER_PAGE = 50;
const BATCH_SIZE = 1000;

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
  return allLaptops;
}

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions
) => {
  const query = useQuery({
    queryKey: ['all-laptops'],
    queryFn: fetchAllLaptops,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    select: (data) => {
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

      const filteredLaptops = filterLaptops(processedLaptops, filters);
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
        allLaptops: processedLaptops
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

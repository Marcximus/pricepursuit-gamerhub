
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processLaptopData } from "@/utils/laptopUtils";
import { filterLaptops } from "@/utils/laptopFilters";
import { sortLaptops } from "@/utils/laptopSort";
import { paginateLaptops } from "@/utils/laptopPagination";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export { collectLaptops, updateLaptops, refreshBrandModels };

export const ITEMS_PER_PAGE = 50;

// Static data fetch that returns a Promise
const fetchLaptopsStatic = async () => {
  console.log('Fetching laptops from database...');
  const { data: laptops, error } = await supabase
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
    .order('wilson_score', { ascending: false });

  if (error) {
    console.error('Error fetching laptops:', error);
    throw error;
  }

  console.log(`Fetched ${laptops?.length || 0} laptops`);
  return laptops || [];
};

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions
) => {
  const query = useQuery({
    queryKey: ['all-laptops', sortBy, page, JSON.stringify(filters)],
    queryFn: async () => {
      try {
        const laptops = await fetchLaptopsStatic();

        if (!laptops || laptops.length === 0) {
          console.log('No laptops found in database');
          return { 
            laptops: [], 
            totalCount: 0,
            totalPages: 0
          };
        }

        const processedLaptops = laptops.map(laptop => {
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
          filteredCount: filteredLaptops.length,
          currentPage: page,
          laptopsOnPage: paginatedResults.laptops.length,
          sortBy,
          filters: {
            brands: Array.from(filters.brands),
            priceRange: filters.priceRange,
          }
        });

        return paginatedResults;
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        throw error;
      }
    },
    // Set a very long stale time to prevent unnecessary refetches
    staleTime: 1000 * 60 * 60, // 1 hour
    // Cache the data for a long time
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    // Only refetch when explicitly invalidated (e.g., after update-laptops completes)
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};


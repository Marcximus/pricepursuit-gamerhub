
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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

// This will be our main query function that fetches all laptops
export const useAllLaptops = () => {
  return useQuery({
    queryKey: ['all-laptops'],
    queryFn: async () => {
      console.log('Fetching all laptops...');
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
        .eq('is_laptop', true);

      if (error) {
        console.error('Error fetching laptops:', error);
        throw error;
      }

      if (!laptops || laptops.length === 0) {
        console.log('No laptops found in database');
        return [];
      }

      return laptops.map(laptop => {
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
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes (renamed from cacheTime)
  });
};

export interface ProcessedData {
  laptops: Product[];
  totalCount: number;
  totalPages: number;
}

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions
): {
  data: ProcessedData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  isRefetching: boolean;
  updateLaptops: typeof updateLaptops;
} => {
  const { data: allLaptops = [], isLoading, error: fetchError, refetch, isRefetching } = useAllLaptops();

  const processedData = useMemo<ProcessedData>(() => {
    console.log('Processing laptops with filters and sort...', {
      totalLaptops: allLaptops.length,
      currentPage: page,
      sortBy,
      filters: {
        brands: Array.from(filters.brands),
        priceRange: filters.priceRange,
      }
    });

    const filteredLaptops = filterLaptops(allLaptops, filters);
    const sortedLaptops = sortLaptops(filteredLaptops, sortBy);
    const paginatedData = paginateLaptops(sortedLaptops, page, ITEMS_PER_PAGE);

    return {
      laptops: paginatedData.laptops,
      totalCount: paginatedData.totalCount,
      totalPages: paginatedData.totalPages
    };
  }, [allLaptops, page, sortBy, filters]);

  return {
    data: processedData,
    isLoading,
    error: fetchError,
    refetch,
    isRefetching,
    updateLaptops,
  };
};

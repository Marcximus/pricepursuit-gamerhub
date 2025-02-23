
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export { collectLaptops, updateLaptops, refreshBrandModels };

export const ITEMS_PER_PAGE = 50;

export const useLaptops = (
  page: number = 1, 
  sortBy: SortOption = 'rating-desc',
  filters: FilterOptions
) => {
  const query = useQuery({
    queryKey: ['laptops', page, sortBy, filters],
    queryFn: async () => {
      try {
        console.log('Fetching laptops with filters:', filters);
        
        // Start building the query
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
          .eq('is_laptop', true);

        // Apply filters
        if (filters.brands.size > 0) {
          query = query.in('brand', Array.from(filters.brands));
        }
        if (filters.processors.size > 0) {
          query = query.in('processor', Array.from(filters.processors));
        }
        if (filters.ramSizes.size > 0) {
          query = query.in('ram', Array.from(filters.ramSizes));
        }
        if (filters.storageOptions.size > 0) {
          query = query.in('storage', Array.from(filters.storageOptions));
        }
        if (filters.graphicsCards.size > 0) {
          query = query.in('graphics', Array.from(filters.graphicsCards));
        }
        if (filters.screenSizes.size > 0) {
          query = query.in('screen_size', Array.from(filters.screenSizes));
        }
        if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
          if (filters.priceRange.min > 0) {
            query = query.gte('current_price', filters.priceRange.min);
          }
          if (filters.priceRange.max < 10000) {
            query = query.lte('current_price', filters.priceRange.max);
          }
        }

        // First get count of filtered results
        const { count: totalCount, error: countError } = await query.count();
        
        if (countError) {
          console.error('Error getting filtered laptop count:', countError);
          throw countError;
        }

        console.log(`Total filtered laptop count: ${totalCount}`);

        // Calculate pagination range
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE - 1;

        // Apply sorting based on the sortBy parameter
        switch (sortBy) {
          case 'price-asc':
            query = query
              .order('current_price', { ascending: true, nullsFirst: false })
              .order('id', { ascending: true }); // Secondary sort for stability
            break;
          case 'price-desc':
            query = query
              .order('current_price', { ascending: false, nullsFirst: false })
              .order('id', { ascending: true }); // Secondary sort for stability
            break;
          case 'rating-desc':
            query = query
              .order('wilson_score', { ascending: false, nullsFirst: false })
              .order('current_price', { ascending: true, nullsFirst: true });
            break;
        }

        // Apply pagination last
        query = query.range(start, end);

        // Execute the query
        const { data: laptops, error } = await query;

        if (error) {
          console.error('Error fetching laptops:', error);
          throw error;
        }

        if (!laptops || laptops.length === 0) {
          console.log('No laptops found for current filters and page');
          return { 
            laptops: [], 
            totalCount: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
          };
        }

        // Process laptops
        const processedLaptops = laptops.map(laptop => {
          const reviews = laptop.product_reviews || [];
          
          // Process reviews
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

          // Calculate average rating if needed
          let avgRating = laptop.rating;
          if (!avgRating && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = totalRating / reviews.length;
          }

          // Return a complete laptop object
          return processLaptopData(laptop);
        });

        return {
          laptops: processedLaptops,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
        };
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};

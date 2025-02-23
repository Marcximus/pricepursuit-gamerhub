
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
    queryKey: ['all-laptops'], // Changed to not depend on filters/pagination
    queryFn: async () => {
      try {
        // Fetch all laptops in one go
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
          return { 
            laptops: [], 
            totalCount: 0,
            totalPages: 0
          };
        }

        // Process all laptops
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

          return processLaptopData(laptop);
        });

        // Apply filters in memory
        let filteredLaptops = processedLaptops.filter(laptop => {
          if (filters.brands.size > 0 && !filters.brands.has(laptop.brand)) return false;
          if (filters.processors.size > 0 && !filters.processors.has(laptop.processor || '')) return false;
          if (filters.ramSizes.size > 0 && !filters.ramSizes.has(laptop.ram || '')) return false;
          if (filters.storageOptions.size > 0 && !filters.storageOptions.has(laptop.storage || '')) return false;
          if (filters.graphicsCards.size > 0 && !filters.graphicsCards.has(laptop.graphics || '')) return false;
          if (filters.screenSizes.size > 0 && !filters.screenSizes.has(laptop.screen_size || '')) return false;
          
          const price = laptop.current_price || 0;
          if (filters.priceRange.min > 0 && price < filters.priceRange.min) return false;
          if (filters.priceRange.max < 10000 && price > filters.priceRange.max) return false;
          
          return true;
        });

        // Apply sorting in memory
        filteredLaptops.sort((a, b) => {
          switch (sortBy) {
            case 'price-asc':
              return (a.current_price || 999999) - (b.current_price || 999999);
            case 'price-desc':
              return (b.current_price || 0) - (a.current_price || 0);
            case 'rating-desc':
              return (b.wilson_score || 0) - (a.wilson_score || 0);
            default:
              return 0;
          }
        });

        // Calculate pagination
        const totalCount = filteredLaptops.length;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedLaptops = filteredLaptops.slice(start, end);

        console.log('Client-side filtering/pagination results:', {
          totalLaptops: processedLaptops.length,
          filteredCount: filteredLaptops.length,
          currentPage: page,
          laptopsOnPage: paginatedLaptops.length
        });

        return {
          laptops: paginatedLaptops,
          totalCount,
          totalPages
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


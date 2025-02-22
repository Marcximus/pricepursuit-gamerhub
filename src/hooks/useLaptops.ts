
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";

export { collectLaptops, updateLaptops, refreshBrandModels };

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Fetching laptops from Supabase...');
        
        // First get a count of all laptop products
        const { count: totalCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_laptop', true);

        if (countError) {
          console.error('Error getting laptop count:', countError);
          throw countError;
        }

        console.log(`Total laptop count in database: ${totalCount}`);
        
        const { data: laptopsData, error } = await supabase
          .from('products')
          .select(`
            *,
            product_reviews (*)
          `)
          .eq('is_laptop', true)
          .order('last_checked', { ascending: false });

        if (error) {
          console.error('Error fetching laptops:', error);
          throw error;
        }

        if (!laptopsData || laptopsData.length === 0) {
          console.log('No laptops found in database');
          return [];
        }

        console.log('Laptops data fetched:', {
          totalCount,
          fetchedCount: laptopsData.length,
          match: totalCount === laptopsData.length ? 'YES' : 'NO'
        });

        // Log count of laptops with prices for debugging
        const laptopsWithPrices = laptopsData.filter(laptop => laptop.current_price != null && laptop.current_price > 0);
        console.log('Laptop price analysis:', {
          totalLaptops: laptopsData.length,
          withPrices: laptopsWithPrices.length,
          withoutPrices: laptopsData.length - laptopsWithPrices.length,
          priceRange: laptopsWithPrices.length > 0 ? {
            min: Math.min(...laptopsWithPrices.map(l => l.current_price || 0)),
            max: Math.max(...laptopsWithPrices.map(l => l.current_price || 0))
          } : 'no prices available'
        });

        // Process and return the laptops
        const processedLaptops = laptopsData.map(laptop => {
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

          // Calculate average rating if needed
          let avgRating = laptop.rating;
          if (!avgRating && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = totalRating / reviews.length;
          }

          return {
            ...laptop,
            average_rating: avgRating,
            total_reviews: reviews.length,
            review_data: reviewData
          };
        });

        const finalLaptops = processedLaptops.map(laptop => processLaptopData(laptop as Product));
        console.log('Final processed laptops:', {
          count: finalLaptops.length,
          uniqueBrands: [...new Set(finalLaptops.map(l => l.brand))].length
        });

        return finalLaptops;
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

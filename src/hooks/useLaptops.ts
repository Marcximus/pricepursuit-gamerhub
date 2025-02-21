
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptopCollection";
import type { Product } from "@/types/product";

export { collectLaptops, updateLaptops, refreshBrandModels };

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Fetching laptops from Supabase...');
        
        const startTime = Date.now();
        const { data: laptopsWithReviews, error } = await supabase
          .from('products')
          .select(`
            *,
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
          .order('last_checked', { ascending: false })
          .order('created_at', { ascending: false });

        console.log(`Query completed in ${Date.now() - startTime}ms`);

        if (error) {
          console.error('Error fetching laptops:', error);
          throw error;
        }

        if (!laptopsWithReviews || laptopsWithReviews.length === 0) {
          console.log('No laptops found in database');
          toast({
            title: "No laptops found",
            description: "Starting initial laptop collection...",
          });
          try {
            await collectLaptops();
          } catch (error) {
            console.error('Failed to start initial collection:', error);
            throw error;
          }
          return [];
        }

        // Check for laptops needing updates
        const outdatedLaptops = laptopsWithReviews.filter(laptop => {
          const lastChecked = laptop.last_checked ? new Date(laptop.last_checked) : null;
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return !laptop.current_price || !lastChecked || lastChecked < oneDayAgo;
        });

        if (outdatedLaptops.length > 0) {
          console.log(`Found ${outdatedLaptops.length} laptops needing updates`);
          try {
            await updateLaptops();
          } catch (error) {
            console.error('Failed to trigger updates:', error);
            // Continue processing existing data even if update fails
          }
        }

        // Check for laptops missing brand/model
        const incompleteLaptops = laptopsWithReviews.filter(laptop => 
          !laptop.brand || !laptop.model
        );

        if (incompleteLaptops.length > 0) {
          console.log(`Found ${incompleteLaptops.length} laptops missing brand/model info`);
          try {
            await refreshBrandModels();
          } catch (error) {
            console.error('Failed to trigger brand/model refresh:', error);
            // Continue processing existing data even if refresh fails
          }
        }

        // Process reviews and ratings for each laptop
        const processedLaptops = laptopsWithReviews.map((laptop) => {
          const reviews = laptop.product_reviews || [];
          
          // Calculate average rating from reviews if available, otherwise use the rating from search
          let avgRating = laptop.rating;
          if (!avgRating && reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = totalRating / reviews.length;
          }

          // Structure review data
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

          // Calculate rating breakdown
          if (reviews.length > 0) {
            reviewData.rating_breakdown = reviews.reduce((acc: any, review) => {
              acc[review.rating] = (acc[review.rating] || 0) + 1;
              return acc;
            }, {});
          }

          return {
            ...laptop,
            average_rating: avgRating,
            total_reviews: reviews.length || laptop.rating_count || 0,
            review_data: reviewData
          };
        });

        // Process each laptop through the existing processor
        console.log(`Processing ${processedLaptops.length} laptops...`);
        return processedLaptops.map(laptop => processLaptopData(laptop as Product));
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        throw error;
      }
    },
    staleTime: 1000 * 30, // Data stays fresh for 30 seconds
    refetchInterval: 1000 * 60, // Check for updates every minute
    retryDelay: 1000,
    retry: 3,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};

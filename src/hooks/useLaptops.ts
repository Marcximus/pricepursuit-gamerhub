
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Starting laptop fetch...');
        
        // Fetch all laptops using pagination
        const CHUNK_SIZE = 1000;
        const allLaptops: any[] = [];
        
        // First get total count
        const { count: totalCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_laptop', true);

        if (countError) {
          console.error('Error getting laptop count:', countError);
          throw countError;
        }

        // Fetch all data in chunks
        for (let i = 0; i < Math.ceil((totalCount || 0) / CHUNK_SIZE); i++) {
          console.log(`Fetching laptops chunk ${i + 1}`);
          
          const { data: laptopsChunk, error } = await supabase
            .from('products')
            .select(`
              *,
              product_reviews (*)
            `)
            .eq('is_laptop', true)
            .order('last_checked', { ascending: false })
            .range(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE - 1);

          if (error) {
            console.error('Error fetching laptops chunk:', error);
            throw error;
          }

          if (laptopsChunk) {
            allLaptops.push(...laptopsChunk);
          }
        }

        console.log(`Successfully fetched ${allLaptops.length} laptops`);

        // Process the laptops
        const processedLaptops = allLaptops.map(laptop => {
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
        
        if (!finalLaptops.length) {
          console.log('No laptops found, initiating collection...');
          try {
            await collectLaptops();
            toast({
              title: "Collection Started",
              description: "Started collecting laptop data. Please wait a few minutes."
            });
          } catch (error) {
            console.error('Error starting collection:', error);
          }
        }

        return finalLaptops;
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch laptops. Please try again."
        });
        throw error;
      }
    },
    staleTime: Infinity, // Keep data fresh forever until manually invalidated
    gcTime: Infinity, // Never delete cached data
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnReconnect: false, // Don't refetch when reconnecting
    retry: 3, // Retry failed requests 3 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  return query;
};

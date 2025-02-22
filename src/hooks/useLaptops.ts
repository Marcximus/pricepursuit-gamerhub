
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";

export { collectLaptops, updateLaptops, refreshBrandModels };

// Static data fallback - stored in module scope
let cachedLaptopsData: Product[] = [];

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Starting laptop fetch...');
        console.log('Supabase client:', !!supabase);
        
        // First get a count of all laptop products
        const { count: totalCount, error: countError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_laptop', true);

        if (countError) {
          console.error('Error getting laptop count:', countError);
          toast({
            variant: "destructive",
            title: "Database Error",
            description: "Failed to get laptop count: " + countError.message
          });
          throw countError;
        }

        console.log(`Found ${totalCount} laptops in database`);

        // If no laptops found, try collecting them
        if (!totalCount || totalCount === 0) {
          console.log('No laptops found, initiating collection...');
          try {
            await collectLaptops();
            toast({
              title: "Collection Started",
              description: "Started collecting laptop data. Please wait a few minutes."
            });
          } catch (collectError) {
            console.error('Error starting collection:', collectError);
            toast({
              variant: "destructive",
              title: "Collection Error",
              description: "Failed to start laptop collection: " + (collectError as Error).message
            });
          }
        }

        // Fetch all laptops using pagination
        const CHUNK_SIZE = 1000;
        const allLaptops: any[] = [];
        
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
            toast({
              variant: "destructive",
              title: "Fetch Error",
              description: "Failed to fetch laptops: " + error.message
            });
            throw error;
          }

          if (laptopsChunk) {
            allLaptops.push(...laptopsChunk);
          }
        }

        console.log(`Fetched ${allLaptops.length} laptops total`);

        if (!allLaptops.length) {
          if (cachedLaptopsData.length > 0) {
            console.log('No laptops found in database, using cached data:', cachedLaptopsData.length);
            return cachedLaptopsData;
          }
          console.log('No laptops found and no cached data available');
          return [];
        }

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
        console.log('Fresh laptops data fetched:', {
          count: finalLaptops.length,
          uniqueBrands: [...new Set(finalLaptops.map(l => l.brand))].length
        });

        // Update cached data
        cachedLaptopsData = [...finalLaptops];
        
        return finalLaptops;
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch laptops. Please try again."
        });
        
        // Return cached data on error if available
        if (cachedLaptopsData.length > 0) {
          console.log('Falling back to cached data:', cachedLaptopsData.length);
          return cachedLaptopsData;
        }
        throw error;
      }
    },
    initialData: () => {
      console.log('Using cached data as initial data:', cachedLaptopsData.length);
      return cachedLaptopsData;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data for 30 minutes
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes in the background
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";

// Keep laptops in memory
let cachedLaptops: Product[] = [];

const fetchLaptopsFromDb = async () => {
  try {
    console.log('Fetching laptops - cache status:', {
      hasCachedData: cachedLaptops.length > 0,
      cachedCount: cachedLaptops.length
    });

    // First try to get data from cache
    if (cachedLaptops.length > 0) {
      console.log('Returning cached laptops:', cachedLaptops.length);
      return cachedLaptops;
    }

    console.log('No cache, fetching from Supabase...');
    
    const { data: laptops, error } = await supabase
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

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found in database');
      return [];
    }

    console.log(`Fetched ${laptops.length} laptops from database`);

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
    
    // Update cache
    cachedLaptops = finalLaptops;
    console.log('Updated cache with', finalLaptops.length, 'laptops');
    
    return finalLaptops;
  } catch (error) {
    console.error('Error in fetchLaptopsFromDb:', error);
    throw error;
  }
};

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: fetchLaptopsFromDb,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep unused data in cache for 10 minutes
    retry: 2,                  // Retry failed requests twice
    refetchOnMount: true,      // Refetch when component mounts
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};

export { collectLaptops, updateLaptops, refreshBrandModels };

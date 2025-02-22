
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";

// Initialize static data as null to indicate no initial fetch has occurred
let staticLaptopData: Product[] | null = null;

const fetchLaptopsFromDb = async () => {
  try {
    // If we have static data and this is an initial load, return it immediately
    if (staticLaptopData !== null) {
      console.log('Returning cached data:', staticLaptopData.length, 'laptops');
      return staticLaptopData;
    }

    console.log('Fetching laptops from Supabase...');
    
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true);

    if (countError) {
      console.error('Error getting laptop count:', countError);
      throw countError;
    }

    console.log(`Total laptop count in database: ${totalCount}`);

    const CHUNK_SIZE = 1000;
    const allLaptops: any[] = [];
    
    for (let i = 0; i < Math.ceil((totalCount || 0) / CHUNK_SIZE); i++) {
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

    console.log(`Successfully fetched ${allLaptops.length} laptops from database`);

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
    staticLaptopData = finalLaptops; // Update static data
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
    staleTime: Infinity, // Never mark data as stale
    gcTime: Infinity, // Never garbage collect
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

export { collectLaptops, updateLaptops, refreshBrandModels };


import { useQuery, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";
import { initialLaptops } from "@/data/initialLaptops";

export { collectLaptops, updateLaptops, refreshBrandModels };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  }
});

// Store initial data globally using our static dataset
let initialData: Product[] = initialLaptops;

const fetchLaptops = async (): Promise<Product[]> => {
  console.log('Fetching laptops from Supabase...');
  
  const { data: laptops, error } = await supabase
    .from('products')
    .select(`
      *,
      product_reviews (*)
    `)
    .eq('is_laptop', true)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching laptops:', error);
    // Return current initialData instead of throwing error
    return initialData;
  }

  if (!laptops || laptops.length === 0) {
    console.log('No laptops found in database, using initial data');
    return initialData;
  }

  console.log('Processing', laptops.length, 'laptops');
  
  const chunkSize = 50;
  const processedLaptops: Product[] = [];
  
  for (let i = 0; i < laptops.length; i += chunkSize) {
    const chunk = laptops.slice(i, i + chunkSize);
    const processed = chunk.map(laptop => {
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

      return processLaptopData({
        ...laptop,
        average_rating: avgRating,
        total_reviews: reviews.length,
        review_data: reviewData
      } as Product);
    });
    
    processedLaptops.push(...processed);
  }

  // Update our initialData with the latest data
  initialData = processedLaptops;
  return processedLaptops;
};

// Start background fetch immediately
console.log('Starting background data fetch...');
fetchLaptops()
  .then(data => {
    console.log('Background data fetch complete:', data.length, 'laptops');
    queryClient.setQueryData(['laptops'], data);
    initialData = data; // Update static data
  })
  .catch(console.error);

export const useLaptops = () => {
  const query = useQuery<Product[]>({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
    gcTime: queryClient.getDefaultOptions().queries?.gcTime,
    staleTime: queryClient.getDefaultOptions().queries?.staleTime,
    refetchOnMount: queryClient.getDefaultOptions().queries?.refetchOnMount,
    refetchOnWindowFocus: queryClient.getDefaultOptions().queries?.refetchOnWindowFocus,
    refetchInterval: queryClient.getDefaultOptions().queries?.refetchInterval,
    // Always return initialData immediately
    placeholderData: () => initialData,
    initialData: () => initialData,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};


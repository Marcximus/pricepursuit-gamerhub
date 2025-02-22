
import { useQuery, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";

export { collectLaptops, updateLaptops, refreshBrandModels };

// Static QueryClient instance for sharing cache across components
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,   // Keep unused data for 10 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  }
});

// Store initial data globally
let initialData: Product[] | undefined;

// Function to fetch laptops that can be used for prefetching
const fetchLaptops = async (): Promise<Product[]> => {
  // Return cached data if available
  if (initialData) {
    console.log('Using cached initial data:', initialData.length, 'laptops');
    return initialData;
  }

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
    throw error;
  }

  if (!laptops || laptops.length === 0) {
    console.log('No laptops found in database');
    return [];
  }

  console.log('Processing', laptops.length, 'laptops');
  
  // Process laptops in chunks to avoid blocking the main thread
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

  // Cache the processed data
  initialData = processedLaptops;
  return processedLaptops;
};

// Prefetch laptops data and store in cache immediately
console.log('Starting initial data prefetch...');
fetchLaptops()
  .then(data => {
    console.log('Initial data prefetch complete:', data.length, 'laptops');
    queryClient.setQueryData(['laptops'], data);
  })
  .catch(console.error);

export const useLaptops = () => {
  const query = useQuery<Product[]>({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
    // Use the shared QueryClient instance
    gcTime: queryClient.getDefaultOptions().queries?.gcTime,
    staleTime: queryClient.getDefaultOptions().queries?.staleTime,
    refetchOnMount: queryClient.getDefaultOptions().queries?.refetchOnMount,
    refetchOnWindowFocus: queryClient.getDefaultOptions().queries?.refetchOnWindowFocus,
    refetchInterval: queryClient.getDefaultOptions().queries?.refetchInterval,
    // Always return initialData as placeholder if available
    placeholderData: () => initialData || [],
    initialData: () => initialData,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
  };
};

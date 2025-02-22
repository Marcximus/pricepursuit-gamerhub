
import { useQuery, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops, refreshBrandModels } from "@/utils/laptop";
import type { Product } from "@/types/product";

export { collectLaptops, updateLaptops, refreshBrandModels };

// Create a static QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // Data stays fresh for 5 minutes
      gcTime: 10 * 60 * 1000,      // Keep unused data for 10 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  }
});

// In-memory cache for instant data access
let cachedData: Product[] | undefined;

// Function to store data in localStorage
const storeInLocalStorage = (data: Product[]) => {
  try {
    localStorage.setItem('laptops-cache', JSON.stringify(data));
    localStorage.setItem('laptops-cache-timestamp', Date.now().toString());
  } catch (error) {
    console.warn('Failed to store laptops in localStorage:', error);
  }
};

// Function to get data from localStorage
const getFromLocalStorage = (): Product[] | undefined => {
  try {
    const timestamp = Number(localStorage.getItem('laptops-cache-timestamp'));
    const cacheAge = Date.now() - timestamp;
    const maxAge = 30 * 60 * 1000; // 30 minutes

    if (cacheAge < maxAge) {
      const cachedData = localStorage.getItem('laptops-cache');
      if (cachedData) {
        console.log('Using localStorage cache, age:', Math.round(cacheAge / 1000), 'seconds');
        return JSON.parse(cachedData);
      }
    }
  } catch (error) {
    console.warn('Failed to retrieve laptops from localStorage:', error);
  }
  return undefined;
};

// Get initial data from the build-time injection
const getBuildTimeData = (): Product[] => {
  try {
    // @ts-ignore - __INITIAL_DATA__ is defined in vite.config.ts
    return __INITIAL_DATA__ || [];
  } catch (e) {
    console.warn('No build-time data available:', e);
    return [];
  }
};

// Function to fetch laptops that can be used for prefetching
const fetchLaptops = async (): Promise<Product[]> => {
  // First try build-time data
  const buildTimeData = getBuildTimeData();
  if (buildTimeData.length > 0) {
    console.log('Using build-time data:', buildTimeData.length, 'laptops');
    return buildTimeData;
  }

  // Return in-memory cache if available
  if (cachedData) {
    console.log('Using in-memory cache:', cachedData.length, 'laptops');
    return cachedData;
  }

  // Try to get data from localStorage
  const localData = getFromLocalStorage();
  if (localData) {
    cachedData = localData; // Store in memory for faster subsequent access
    return localData;
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

  // Store the processed data in both caches
  cachedData = processedLaptops;
  storeInLocalStorage(processedLaptops);
  
  return processedLaptops;
};

// Pre-fetch laptops data immediately
console.log('Starting initial data prefetch...');
fetchLaptops()
  .then(data => {
    console.log('Initial data prefetch complete:', data.length, 'laptops');
    queryClient.setQueryData(['laptops'], data);
  })
  .catch(console.error);

// Function to clear cache (useful for debugging or forced refresh)
export const clearLaptopsCache = () => {
  cachedData = undefined;
  localStorage.removeItem('laptops-cache');
  localStorage.removeItem('laptops-cache-timestamp');
  queryClient.removeQueries({ queryKey: ['laptops'] });
};

export const useLaptops = () => {
  const query = useQuery<Product[]>({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
    gcTime: queryClient.getDefaultOptions().queries?.gcTime,
    staleTime: queryClient.getDefaultOptions().queries?.staleTime,
    refetchOnMount: queryClient.getDefaultOptions().queries?.refetchOnMount,
    refetchOnWindowFocus: queryClient.getDefaultOptions().queries?.refetchOnWindowFocus,
    refetchInterval: queryClient.getDefaultOptions().queries?.refetchInterval,
    // Initialize with build-time data, then fall back to other caches
    initialData: () => getBuildTimeData() || cachedData || getFromLocalStorage() || [],
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
    refreshBrandModels,
    clearCache: clearLaptopsCache,
  };
};

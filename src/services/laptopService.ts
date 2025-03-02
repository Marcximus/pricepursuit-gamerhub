
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

const BATCH_SIZE = 1000;

// This function can be called directly or through React Query
export async function fetchAllLaptops(options = {}) {
  // Check if we have this data in the React Query cache
  const queryClient = new QueryClient();
  const cachedData = queryClient.getQueryData(['all-laptops-raw']);
  
  if (cachedData) {
    console.log('Using cached laptop data');
    return cachedData;
  }
  
  console.log('Cache miss - fetching all laptops from database');
  
  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  console.log('Starting to fetch all laptops in batches...');

  while (hasMore) {
    let query = supabase
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
      .eq('is_laptop', true)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: laptops, error } = await query;

    if (error) {
      console.error('Error fetching laptops batch:', error);
      throw error;
    }

    if (!laptops || laptops.length === 0) {
      hasMore = false;
      break;
    }

    allLaptops = [...allLaptops, ...laptops];
    lastId = laptops[laptops.length - 1].id;

    if (laptops.length < BATCH_SIZE) {
      hasMore = false;
    }

    console.log(`Fetched batch of ${laptops.length} laptops, total so far: ${allLaptops.length}`);
  }

  console.log(`Completed fetching all laptops. Total count: ${allLaptops.length}`);
  
  // Store in cache for future use
  queryClient.setQueryData(['all-laptops-raw'], allLaptops);
  
  return allLaptops;
}


import { supabase } from "@/integrations/supabase/client";

const BATCH_SIZE = 1000;

/**
 * Fetches all laptops for filtering (used for generating filter options)
 * If minimalForFilters is true, fetches only the data needed for filters
 */
export async function fetchAllLaptops(minimalForFilters = false) {
  let allLaptops: any[] = [];
  let lastId: string | null = null;
  let hasMore = true;

  console.log(`Starting to fetch ${minimalForFilters ? 'minimal' : 'all'} laptops in batches...`);

  // Select only the columns needed for filtering if minimal mode is enabled
  const columns = minimalForFilters ? `
    id,
    processor,
    ram,
    storage,
    graphics,
    screen_size,
    brand,
    current_price
  ` : `
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
  `;

  while (hasMore) {
    let query = supabase
      .from('products')
      .select(columns)
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
    
    // Safely access the last laptop's ID, ensuring laptops array is not empty
    if (laptops.length > 0) {
      const lastLaptopIndex = laptops.length - 1;
      const potentialLastLaptop = laptops[lastLaptopIndex];
      
      // First check if potentialLastLaptop exists at all before trying to access its properties
      if (potentialLastLaptop !== null && potentialLastLaptop !== undefined) {
        // Then verify it's an object with a valid ID property
        // Use type guard to satisfy TypeScript
        if (typeof potentialLastLaptop === 'object' && potentialLastLaptop !== null && 
            'id' in potentialLastLaptop && 
            potentialLastLaptop.id) {
          lastId = potentialLastLaptop.id;
        } else {
          // Break the loop if we don't have a valid ID to continue with
          console.warn('No valid ID found in the last laptop of the batch, stopping pagination');
          hasMore = false;
        }
      } else {
        console.warn('Last laptop in the batch is null or undefined, stopping pagination');
        hasMore = false;
      }
    } else {
      // This is a safety check, but should never happen due to the earlier empty check
      hasMore = false;
    }

    if (laptops.length < BATCH_SIZE) {
      hasMore = false;
    }

    console.log(`Fetched batch of ${laptops.length} laptops, total so far: ${allLaptops.length}`);
  }

  console.log(`Completed fetching ${minimalForFilters ? 'minimal' : 'all'} laptops. Total count: ${allLaptops.length}`);
  return allLaptops;
}

/**
 * Fetches laptops with pagination directly from the database
 * This approach skips client-side filtering for better performance
 */
export async function fetchPaginatedLaptops(page = 1, pageSize = 50, sortBy = 'rating-desc') {
  console.time('fetchPaginatedLaptops');
  
  // Convert sort option to database column and direction
  let sortColumn = 'wilson_score';
  let sortDirection: 'asc' | 'desc' = 'desc';
  
  if (sortBy === 'price-asc') {
    sortColumn = 'current_price';
    sortDirection = 'asc';
  } else if (sortBy === 'price-desc') {
    sortColumn = 'current_price';
    sortDirection = 'desc';
  } else if (sortBy === 'rating-asc') {
    sortColumn = 'wilson_score';
    sortDirection = 'asc';
  }
  
  // Calculate offset
  const offset = (page - 1) * pageSize;
  
  // Fetch count first for pagination
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_laptop', true);
  
  if (countError) {
    console.error('Error fetching laptop count:', countError);
    throw countError;
  }
  
  // Fetch the laptops for current page
  const { data: laptops, error } = await supabase
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
    .order(sortColumn, { ascending: sortDirection === 'asc' })
    .range(offset, offset + pageSize - 1);
    
  if (error) {
    console.error('Error fetching paginated laptops:', error);
    throw error;
  }
  
  console.timeEnd('fetchPaginatedLaptops');
  
  // Calculate the total pages
  const totalPages = Math.ceil((count || 0) / pageSize);
  
  return {
    laptops: laptops || [],
    totalCount: count || 0,
    currentPage: page,
    totalPages: totalPages
  };
}

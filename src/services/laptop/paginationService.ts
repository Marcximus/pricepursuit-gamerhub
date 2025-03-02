
import { supabase } from "@/integrations/supabase/client";
import { getLaptopColumns } from "./utils";
import type { Product } from "@/types/product";

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
  
  try {
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
    const { data: laptopData, error } = await supabase
      .from('products')
      .select(getLaptopColumns())
      .eq('is_laptop', true)
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(offset, offset + pageSize - 1);
      
    if (error) {
      console.error('Error fetching paginated laptops:', error);
      throw error;
    }
    
    console.timeEnd('fetchPaginatedLaptops');
    
    // Ensure we have an array of laptops and properly type it
    const laptops: Product[] = Array.isArray(laptopData) ? (laptopData as Product[]) : [];
    
    // Calculate the total pages
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    return {
      laptops,
      totalCount: count || 0,
      currentPage: page,
      totalPages: totalPages
    };
  } catch (err) {
    console.error('Error in fetchPaginatedLaptops:', err);
    // Return empty results in case of error
    return {
      laptops: [] as Product[],
      totalCount: 0,
      currentPage: page,
      totalPages: 0
    };
  }
}

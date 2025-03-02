
import { fetchLaptopsInBatches, fetchPaginatedLaptops } from "./laptop";
import type { Product } from "@/types/product";

/**
 * Fetches all laptops for filtering (used for generating filter options)
 * If minimalForFilters is true, fetches only the data needed for filters
 */
export async function fetchAllLaptops(minimalForFilters = false): Promise<Product[]> {
  try {
    return await fetchLaptopsInBatches(minimalForFilters);
  } catch (error) {
    console.error('Error in fetchAllLaptops:', error);
    // Return empty array in case of error to prevent app crashes
    return [];
  }
}

/**
 * Fetches laptops with pagination directly from the database
 * This approach skips client-side filtering for better performance
 */
export { fetchPaginatedLaptops };

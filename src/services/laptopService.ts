
import { fetchLaptopsInBatches, fetchPaginatedLaptops } from "./laptop";

/**
 * Fetches all laptops for filtering (used for generating filter options)
 * If minimalForFilters is true, fetches only the data needed for filters
 */
export async function fetchAllLaptops(minimalForFilters = false) {
  return fetchLaptopsInBatches(minimalForFilters);
}

/**
 * Fetches laptops with pagination directly from the database
 * This approach skips client-side filtering for better performance
 */
export { fetchPaginatedLaptops };

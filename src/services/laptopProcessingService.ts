
import type { SortOption } from "@/components/laptops/LaptopSort";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { sortLaptops } from "@/utils/laptopSort";
import { filterLaptops } from "@/utils/laptop/filter/filterLaptops";
import { containsForbiddenKeywords, applyAllProductFilters } from "@/utils/laptop/productFilters";

export function processAndFilterLaptops(
  allLaptops: any[],
  filters: FilterOptions,
  sortBy: SortOption,
  page: number,
  itemsPerPage: number
) {
  // Apply forbidden keywords filter first - only looking at titles
  const filteredByKeywords = applyAllProductFilters(allLaptops);
  
  // Step 1: Apply text search if there's a search query
  let filteredLaptops = filteredByKeywords;
  if (filters.searchQuery && filters.searchQuery.trim() !== "") {
    const searchTerms = filters.searchQuery.toLowerCase().trim().split(/\s+/);
    filteredLaptops = filteredByKeywords.filter(laptop => {
      const titleText = (laptop.title || "").toLowerCase();
      const brandText = (laptop.brand || "").toLowerCase();
      const processorText = (laptop.processor || "").toLowerCase();
      const ramText = (laptop.ram || "").toLowerCase();
      const storageText = (laptop.storage || "").toLowerCase();
      const graphicsText = (laptop.graphics || "").toLowerCase();
      
      // Combine all searchable text
      const allText = `${titleText} ${brandText} ${processorText} ${ramText} ${storageText} ${graphicsText}`;
      
      // Check if all search terms are found in the combined text
      return searchTerms.every(term => allText.includes(term));
    });
  }

  // Step 2: Apply regular filters to the already search-filtered results
  const filteredBySpecsLaptops = filterLaptops(filteredLaptops, filters);
  
  // Step 3: Sort the filtered results
  const sortedLaptops = sortLaptops(filteredBySpecsLaptops, sortBy);
  
  // Step 4: Paginate the results
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLaptops = sortedLaptops.slice(startIndex, endIndex);
  
  // Calculate total pages
  const totalPages = Math.ceil(sortedLaptops.length / itemsPerPage);
  
  return {
    laptops: paginatedLaptops,
    totalCount: sortedLaptops.length,
    totalPages,
    allLaptops: filteredByKeywords, // Return the filtered laptops without specs filtering
  };
}

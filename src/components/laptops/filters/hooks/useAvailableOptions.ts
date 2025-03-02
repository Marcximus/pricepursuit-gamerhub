
import { Product } from "@/types/product";
import { FilterCategoryKey } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";

/**
 * Utility function to efficiently find available options for a category
 * Uses optimized approach with Set operations and caching
 */
export const findAvailableOptions = (
  category: FilterCategoryKey,
  laptops: Product[],
  fieldKey: keyof Product,
  optionsSet: Set<string>
): Set<string> => {
  // Use Set for O(1) lookups
  const availableOptions = new Set<string>();
  
  // Create a Map to cache matches for better performance
  const optionMatchCache: Map<string, boolean> = new Map();
  
  // Check each option against the laptops
  for (const option of optionsSet) {
    // Use for-of loop with early break for better performance
    let isAvailable = false;
    
    for (const laptop of laptops) {
      const fieldValue = laptop[fieldKey];
      
      // Skip if the laptop doesn't have this field value
      if (!fieldValue) continue;
      
      // Create a cache key for this option-field combination
      const cacheKey = `${option}:${fieldValue}`;
      
      // Check if we already determined if this option matches this field value
      if (optionMatchCache.has(cacheKey)) {
        if (optionMatchCache.get(cacheKey)) {
          isAvailable = true;
          break;
        }
        continue;
      }
      
      // Calculate match and cache the result
      const matches = matchesFilter(option, fieldValue as string, fieldKey as any, laptop.title);
      optionMatchCache.set(cacheKey, matches);
      
      if (matches) {
        isAvailable = true;
        break;
      }
    }
    
    if (isAvailable) {
      availableOptions.add(option);
    }
  }
  
  return availableOptions;
};


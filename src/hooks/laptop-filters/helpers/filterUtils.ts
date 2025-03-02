
import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";

/**
 * Generic utility to get valid values for a specific laptop property
 */
export const getValidValues = (
  laptops: Product[], 
  key: FilterableProductKeys,
  normalizer: (value: string) => string,
  validator?: (value: string) => boolean
): string[] => {
  console.log(`Processing ${laptops.length} laptops for ${key} filter values`);
  
  // Track statistics for debugging
  let totalValues = 0;
  let normalizedValues = 0;
  let validatedValues = 0;
  
  const allValues = new Set<string>();
  
  laptops.forEach(laptop => {
    const value = laptop[key];
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return;
    }
    
    totalValues++;
    
    // Try to extract multiple values from a single field (e.g., "8GB RAM")
    const valueString = String(value).trim();
    let normalized: string;
    
    try {
      normalized = normalizer(valueString);
      if (normalized) normalizedValues++;
    } catch (error) {
      console.error(`Error normalizing ${key} value "${valueString}":`, error);
      return;
    }
    
    // Skip if normalized value is empty or doesn't pass validation
    if (!normalized) return;
    
    if (validator && !validator(normalized)) {
      return;
    }
    
    validatedValues++;
    allValues.add(normalized);
    
    // For storage, also try to add standardized versions (e.g., "512GB" from "512 GB SSD")
    if (key === 'storage') {
      // Extract storage capacity values (e.g., 512GB, 1TB)
      const capacityMatch = valueString.match(/(\d+)\s*(GB|TB|gb|tb)/i);
      if (capacityMatch) {
        const capacity = capacityMatch[1];
        const unit = capacityMatch[2].toUpperCase();
        const standardizedValue = `${capacity}${unit}`;
        allValues.add(standardizedValue);
      }
    }
  });
  
  console.log(`${key} filter processing stats: total=${totalValues}, normalized=${normalizedValues}, validated=${validatedValues}, unique=${allValues.size}`);
  
  return Array.from(allValues);
};

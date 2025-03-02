
import type { Product } from "@/types/product";
import type { FilterableProductKeys } from "@/utils/laptop/filter";

/**
 * Generic utility to get valid values for a specific laptop property
 * Now improved to handle more edge cases and extract values more effectively
 */
export const getValidValues = (
  laptops: Product[], 
  key: FilterableProductKeys,
  normalizer: (value: string) => string,
  validator?: (value: string) => boolean
): string[] => {
  console.log(`Processing ${laptops.length} laptops for ${key} filter values`);
  
  if (!laptops || laptops.length === 0) {
    console.log(`No laptops to process for ${key} filter values`);
    return [];
  }
  
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
      
      // Also extract SSD/HDD type information
      const typeMatch = valueString.match(/(SSD|HDD|eMMC|NVMe)/i);
      if (typeMatch) {
        // Add storage type as a filter option
        const storageType = typeMatch[1].toUpperCase();
        
        // For SSD, also add with capacity if available
        if (capacityMatch && storageType === 'SSD') {
          const capacity = capacityMatch[1];
          const unit = capacityMatch[2].toUpperCase();
          allValues.add(`${capacity}${unit} ${storageType}`);
        }
      }
    }
    
    // For RAM, also try to extract and standardize common sizes
    if (key === 'ram') {
      const ramMatch = valueString.match(/(\d+)\s*(GB|gb)/i);
      if (ramMatch) {
        const size = ramMatch[1];
        allValues.add(`${size}GB`);
      }
    }
    
    // For processors, try to extract common model families
    if (key === 'processor') {
      // Check for Intel Core i-series
      const intelMatch = valueString.match(/core\s+i(\d+)/i);
      if (intelMatch) {
        allValues.add(`Intel Core i${intelMatch[1]}`);
      }
      
      // Check for AMD Ryzen series
      const ryzenMatch = valueString.match(/ryzen\s+(\d+)/i);
      if (ryzenMatch) {
        allValues.add(`AMD Ryzen ${ryzenMatch[1]}`);
      }
      
      // Check for Apple M-series
      const appleMatch = valueString.match(/apple\s+m(\d+)/i);
      if (appleMatch) {
        allValues.add(`Apple M${appleMatch[1]}`);
      }
    }
  });
  
  console.log(`${key} filter processing stats: total=${totalValues}, normalized=${normalizedValues}, validated=${validatedValues}, unique=${allValues.size}`);
  
  return Array.from(allValues);
};

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
  const valueCounts = new Map<string, number>();
  
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
    
    // Track count of each value for frequency analysis
    valueCounts.set(normalized, (valueCounts.get(normalized) || 0) + 1);
    
    // For storage, also try to add standardized versions (e.g., "512GB" from "512 GB SSD")
    if (key === 'storage') {
      // Extract storage capacity values (e.g., 512GB, 1TB)
      const capacityMatch = valueString.match(/(\d+)\s*(GB|TB|gb|tb)/i);
      if (capacityMatch) {
        const capacity = capacityMatch[1];
        const unit = capacityMatch[2].toUpperCase();
        const standardizedValue = `${capacity}${unit}`;
        allValues.add(standardizedValue);
        valueCounts.set(standardizedValue, (valueCounts.get(standardizedValue) || 0) + 1);
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
          const combinedValue = `${capacity}${unit} ${storageType}`;
          allValues.add(combinedValue);
          valueCounts.set(combinedValue, (valueCounts.get(combinedValue) || 0) + 1);
        }
      }
    }
    
    // For RAM, also try to extract and standardize common sizes
    if (key === 'ram') {
      const ramMatch = valueString.match(/(\d+)\s*(GB|gb)/i);
      if (ramMatch) {
        const size = ramMatch[1];
        const standardizedRam = `${size}GB`;
        allValues.add(standardizedRam);
        valueCounts.set(standardizedRam, (valueCounts.get(standardizedRam) || 0) + 1);
        
        // Also add common descriptions like "16GB RAM"
        const ramWithLabel = `${size}GB RAM`;
        allValues.add(ramWithLabel);
        valueCounts.set(ramWithLabel, (valueCounts.get(ramWithLabel) || 0) + 1);
      }
    }
    
    // For processors, try to extract common model families
    if (key === 'processor') {
      // Check for Intel Core i-series
      const intelMatch = valueString.match(/core\s+i(\d+)/i);
      if (intelMatch) {
        const intelCore = `Intel Core i${intelMatch[1]}`;
        allValues.add(intelCore);
        valueCounts.set(intelCore, (valueCounts.get(intelCore) || 0) + 1);
      }
      
      // Check for AMD Ryzen series
      const ryzenMatch = valueString.match(/ryzen\s+(\d+)/i);
      if (ryzenMatch) {
        const ryzen = `AMD Ryzen ${ryzenMatch[1]}`;
        allValues.add(ryzen);
        valueCounts.set(ryzen, (valueCounts.get(ryzen) || 0) + 1);
      }
      
      // Check for Apple M-series
      const appleMatch = valueString.match(/apple\s+m(\d+)/i);
      if (appleMatch) {
        const apple = `Apple M${appleMatch[1]}`;
        allValues.add(apple);
        valueCounts.set(apple, (valueCounts.get(apple) || 0) + 1);
      }
    }
    
    // For screen sizes, standardize into common formats
    if (key === 'screen_size') {
      const sizeMatch = valueString.match(/(\d+(\.\d+)?)\s*inch/i);
      if (sizeMatch) {
        const size = sizeMatch[1];
        const standardizedSize = `${size}"`;
        allValues.add(standardizedSize);
        valueCounts.set(standardizedSize, (valueCounts.get(standardizedSize) || 0) + 1);
      }
    }
  });
  
  // Filter out low-frequency values (less than 2 occurrences) to reduce noise
  // But keep all values for brands, as they're important for filtering
  let filteredValues = Array.from(allValues);
  if (key !== 'brand' && allValues.size > 30) {
    filteredValues = filteredValues.filter(value => 
      (valueCounts.get(value) || 0) > 1
    );
  }
  
  console.log(`${key} filter processing stats: total=${totalValues}, normalized=${normalizedValues}, validated=${validatedValues}, unique=${allValues.size}, filtered=${filteredValues.length}`);
  
  return filteredValues;
};

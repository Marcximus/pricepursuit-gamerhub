
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
  const validValues = laptops
    .map(laptop => {
      const value = laptop[key];
      if (!value || typeof value !== 'string' || value.trim() === '') {
        return null;
      }

      const normalized = normalizer(value);
      
      // Skip if normalized value is empty or doesn't pass validation
      if (!normalized || (validator && !validator(normalized))) {
        return null;
      }
      
      return normalized;
    })
    .filter((value): value is string => value !== null && value !== '');

  // Special debug for storage values
  if (key === 'storage') {
    const before = laptops.filter(laptop => laptop.storage).length;
    const after = validValues.length;
    console.log(`Storage filtering: ${before} raw values, ${after} valid values`);
  }

  // Return unique values
  return Array.from(new Set(validValues));
};

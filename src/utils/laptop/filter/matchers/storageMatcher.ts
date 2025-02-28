
import { parseValueWithUnit } from './commonMatchers';

/**
 * Matcher for storage filter values
 */
export const matchesStorageFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  const filterStorage = parseValueWithUnit(filterValue);
  const productStorage = parseValueWithUnit(productValue);
  
  if (!filterStorage || !productStorage) return false;
  
  // Convert to consistent unit (GB)
  const filterGB = filterStorage.unit === 'gb' ? filterStorage.value : filterStorage.value * 1024;
  const productGB = productStorage.unit === 'gb' ? productStorage.value : productStorage.value * 1024;
  
  // Storage capacities should match precisely for filtering purposes
  return Math.abs(filterGB - productGB) < 1; // Allow a small tolerance for rounding errors
};


import { parseValueWithUnit } from './commonMatchers';
import { getStorageValue } from '../../valueParser';

/**
 * Matcher for storage filter values with group matching support
 */
export const matchesStorageFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Special handling for storage groups (100GB+, 200GB+, etc.)
  if (filterValue.endsWith('+')) {
    const storageGB = getStorageValue(productValue);
    if (storageGB === 0) return false;
    
    // Extract the minimum value from the filter (e.g. "500GB+" → 500)
    const minValueMatch = filterValue.match(/(\d+)(?:GB|TB)\+/i);
    if (!minValueMatch) return false;
    
    const filterUnit = filterValue.includes('TB') ? 'TB' : 'GB';
    const minValue = parseInt(minValueMatch[1], 10);
    
    // Convert to GB for comparison if needed
    const minValueGB = filterUnit === 'TB' ? minValue * 1024 : minValue;
    
    // Match if the product's storage is greater than or equal to the minimum
    return storageGB >= minValueGB;
  }
  
  // For exact matches (legacy support)
  const filterStorage = parseValueWithUnit(filterValue);
  const productStorage = parseValueWithUnit(productValue);
  
  if (!filterStorage || !productStorage) return false;
  
  // Convert to consistent unit (GB)
  const filterGB = filterStorage.unit === 'gb' ? filterStorage.value : filterStorage.value * 1024;
  const productGB = productStorage.unit === 'gb' ? productStorage.value : productStorage.value * 1024;
  
  // Storage capacities should match precisely for filtering purposes
  // With a small tolerance for rounding errors
  return Math.abs(filterGB - productGB) < 1;
};

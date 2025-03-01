
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
    
    // Define the upper bound based on the filter
    let maxValueGB: number | undefined;
    
    // Set upper bounds for each filter category
    if (minValueGB === 100) {
      maxValueGB = 200 - 1; // 100GB+ covers 100GB to 199GB
    } else if (minValueGB === 200) {
      maxValueGB = 500 - 1; // 200GB+ covers 200GB to 499GB
    } else if (minValueGB === 500) {
      maxValueGB = 1024 - 1; // 500GB+ covers 500GB to 1023GB (just under 1TB)
    } else if (minValueGB === 1024) {
      maxValueGB = 2048 - 1; // 1TB+ covers 1TB to 1.99TB
    } else if (minValueGB === 2048) {
      maxValueGB = 4096 - 1; // 2TB+ covers 2TB to 3.99TB
    } else if (minValueGB === 4096) {
      maxValueGB = 8192 - 1; // 4TB+ covers 4TB to 7.99TB
    } 
    // 8TB+ covers 8TB and above, so no upper bound needed
    
    // Match if the product's storage is within the range
    if (maxValueGB) {
      return storageGB >= minValueGB && storageGB <= maxValueGB;
    } else {
      // For 8TB+ (or any other case without an upper bound)
      return storageGB >= minValueGB;
    }
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

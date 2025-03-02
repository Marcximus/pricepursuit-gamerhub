
import { parseValueWithUnit } from './commonMatchers';

// Cache for RAM value parsing to avoid redundant operations
const ramValueCache = new Map<string, {value: number; unit: string} | null>();

/**
 * Matcher for RAM filter values with improved performance
 */
export const matchesRamFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;

  // Get parsed RAM values from cache or compute them
  let filterRAM = ramValueCache.get(filterValue);
  if (filterRAM === undefined) {
    filterRAM = parseValueWithUnit(filterValue);
    ramValueCache.set(filterValue, filterRAM);
  }
  
  let productRAM = ramValueCache.get(productValue);
  if (productRAM === undefined) {
    productRAM = parseValueWithUnit(productValue);
    ramValueCache.set(productValue, productRAM);
  }
  
  if (!filterRAM || !productRAM) return false;
  
  // Convert to consistent unit (GB)
  const filterGB = filterRAM.unit === 'gb' ? filterRAM.value : filterRAM.value * 1024;
  const productGB = productRAM.unit === 'gb' ? productRAM.value : productRAM.value * 1024;
  
  // RAM sizes should match precisely for filtering purposes
  // With a small tolerance for rounding errors
  return Math.abs(filterGB - productGB) < 0.5;
};

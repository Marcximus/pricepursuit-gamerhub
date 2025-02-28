
import { parseValueWithUnit } from './commonMatchers';

/**
 * Matcher for RAM filter values
 */
export const matchesRamFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  const filterRAM = parseValueWithUnit(filterValue);
  const productRAM = parseValueWithUnit(productValue);
  
  if (!filterRAM || !productRAM) return false;
  
  // Convert to consistent unit (GB)
  const filterGB = filterRAM.unit === 'gb' ? filterRAM.value : filterRAM.value * 1024;
  const productGB = productRAM.unit === 'gb' ? productRAM.value : productRAM.value * 1024;
  
  // RAM sizes should match precisely for filtering purposes
  return Math.abs(filterGB - productGB) < 0.5; // Allow a small tolerance for rounding errors
};

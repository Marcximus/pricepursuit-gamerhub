
import { parseValueWithUnit } from './commonMatchers';
import { getRamValue } from '../../parsers/ramParser';

/**
 * Matcher for RAM filter values with improved accuracy
 */
export const matchesRamFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Enhanced check: verify this value is actually RAM and not storage/GPU
  // Check for RAM indicators in the value or title
  const isRamValue = 
    /\b(ram|memory|ddr)\b/i.test(productValue) || 
    (productTitle && /\b(\d+)\s*gb\s*(ram|memory|ddr)\b/i.test(productTitle));
  
  // If it's not clearly RAM-related and title doesn't have RAM indicators near this value, be cautious
  if (!isRamValue && productTitle) {
    // Extract the numeric part from productValue
    const match = productValue.match(/(\d+)\s*GB/i);
    if (match) {
      const valueInTitle = match[1];
      // Look for this value in title with RAM indicators
      const ramRegex = new RegExp(`\\b${valueInTitle}\\s*GB\\s*(DDR\\d?|RAM|Memory)\\b`, 'i');
      
      // If we don't find RAM indicators near this value in title,
      // check if it looks like storage instead
      if (!ramRegex.test(productTitle)) {
        const storageRegex = new RegExp(`\\b${valueInTitle}\\s*GB\\s*(SSD|HDD|Storage|eMMC)\\b`, 'i');
        if (storageRegex.test(productTitle)) {
          return false; // This is likely storage, not RAM
        }
      }
    }
  }
  
  const filterRAM = parseValueWithUnit(filterValue);
  const productRAM = parseValueWithUnit(productValue);
  
  if (!filterRAM || !productRAM) return false;
  
  // Convert to consistent unit (GB)
  const filterGB = filterRAM.unit === 'gb' ? filterRAM.value : filterRAM.value * 1024;
  const productGB = productRAM.unit === 'gb' ? productRAM.value : productRAM.value * 1024;
  
  // RAM sizes should match precisely for filtering purposes
  // With a small tolerance for rounding errors
  return Math.abs(filterGB - productGB) < 0.5;
};

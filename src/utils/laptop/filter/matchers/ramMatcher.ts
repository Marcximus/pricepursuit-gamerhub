
import { parseValueWithUnit } from './commonMatchers';

/**
 * Matcher for RAM filter values with improved efficiency
 */
export const matchesRamFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Quick check for explicit RAM indicators before doing more complex parsing
  const isExplicitlyRam = /\bram\b|\bmemory\b|\bddr\d?\b/i.test(productValue);
  
  // Fast path: If the product value explicitly mentions RAM, proceed with direct comparison
  if (isExplicitlyRam) {
    const filterRAM = parseValueWithUnit(filterValue);
    const productRAM = parseValueWithUnit(productValue);
    
    if (!filterRAM || !productRAM) return false;
    
    // Convert to consistent unit (GB)
    const filterGB = filterRAM.unit === 'gb' ? filterRAM.value : filterRAM.value * 1024;
    const productGB = productRAM.unit === 'gb' ? productRAM.value : productRAM.value * 1024;
    
    // RAM sizes should match precisely with a small tolerance for rounding errors
    return Math.abs(filterGB - productGB) < 0.5;
  }
  
  // Slower path: We need to verify this is actually RAM and not storage/GPU memory
  if (productTitle) {
    // Extract the numeric part from productValue
    const match = productValue.match(/(\d+)\s*GB/i);
    if (match) {
      const valueInTitle = match[1];
      
      // Look for this value in title with RAM indicators nearby
      const ramRegex = new RegExp(`\\b${valueInTitle}\\s*GB\\s*(DDR\\d?|RAM|Memory)\\b`, 'i');
      
      if (ramRegex.test(productTitle)) {
        // Confirmed as RAM, now compare values
        const filterRAM = parseValueWithUnit(filterValue);
        const productRAM = parseValueWithUnit(productValue);
        
        if (!filterRAM || !productRAM) return false;
        
        // Convert to GB for comparison
        const filterGB = filterRAM.unit === 'gb' ? filterRAM.value : filterRAM.value * 1024;
        const productGB = productRAM.unit === 'gb' ? productRAM.value : productRAM.value * 1024;
        
        return Math.abs(filterGB - productGB) < 0.5;
      }
      
      // Check if it looks like storage instead
      const storageRegex = new RegExp(`\\b${valueInTitle}\\s*GB\\s*(SSD|HDD|Storage|eMMC)\\b`, 'i');
      if (storageRegex.test(productTitle)) {
        return false; // This is likely storage, not RAM
      }
    }
  }
  
  // If we get here, do a more careful comparison
  const filterRAM = parseValueWithUnit(filterValue);
  const productRAM = parseValueWithUnit(productValue);
  
  if (!filterRAM || !productRAM) return false;
  
  // Convert to GB for comparison
  const filterGB = filterRAM.unit === 'gb' ? filterRAM.value : filterRAM.value * 1024;
  const productGB = productRAM.unit === 'gb' ? productRAM.value : productRAM.value * 1024;
  
  return Math.abs(filterGB - productGB) < 0.5;
};

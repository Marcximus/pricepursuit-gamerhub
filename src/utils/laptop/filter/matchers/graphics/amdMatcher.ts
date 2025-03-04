
/**
 * Enhanced matcher for AMD graphics cards (Radeon series)
 * with improved model number extraction and matching
 */
export const matchesAmdGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  // Normalize to remove extra spaces
  const normalizedFilter = filterLower.replace(/\s+/g, ' ');
  const normalizedProduct = productLower.replace(/\s+/g, ' ');
  
  // Check for RX series specifically
  const filterHasRX = normalizedFilter.includes('rx');
  const productHasRX = normalizedProduct.includes('rx');
  
  // Check for Vega series
  const filterHasVega = normalizedFilter.includes('vega');
  const productHasVega = normalizedProduct.includes('vega');
  
  // Enhanced model number extraction for RX series
  if (filterHasRX && productHasRX) {
    // Look for RX series number (e.g., RX 580, RX 6700 XT)
    const filterSeriesMatch = normalizedFilter.match(/rx\s*(\d{3,4})(?:\s*xt)?/i);
    const productSeriesMatch = normalizedProduct.match(/rx\s*(\d{3,4})(?:\s*xt)?/i);
    
    if (filterSeriesMatch && productSeriesMatch) {
      // Extract model numbers
      const filterModel = parseInt(filterSeriesMatch[1], 10);
      const productModel = parseInt(productSeriesMatch[1], 10);
      
      // Check if model numbers match or are in the same series
      // For example, RX 6700 and RX 6750 are in the same series (6000)
      if (filterModel === productModel) {
        return true;
      }
      
      // Check for same series (first digit for older models, first two for newer)
      if (filterModel >= 5000 && productModel >= 5000) {
        // For 5000+ series, compare first digit (e.g., 5xxx vs 6xxx)
        return Math.floor(filterModel / 1000) === Math.floor(productModel / 1000);
      } else {
        // For older series, just check if they're in the same hundred (e.g., 580 vs 570)
        return Math.floor(filterModel / 100) === Math.floor(productModel / 100);
      }
    }
    
    // If one has a model number but the other doesn't, they don't match
    if (filterSeriesMatch || productSeriesMatch) {
      return false;
    }
    
    // Both have RX but no specific model, so they match
    return true;
  }
  
  // Specific handling for Vega series
  if (filterHasVega && productHasVega) {
    // Extract Vega numbers if present
    const filterVegaMatch = normalizedFilter.match(/vega\s*(\d+)/i);
    const productVegaMatch = normalizedProduct.match(/vega\s*(\d+)/i);
    
    if (filterVegaMatch && productVegaMatch) {
      return filterVegaMatch[1] === productVegaMatch[1];
    }
    
    // If one has a Vega number but the other doesn't, they don't match
    if (filterVegaMatch || productVegaMatch) {
      return false;
    }
    
    // Both just mention Vega with no number
    return true;
  }
  
  // If filter contains "amd" or "radeon" without specific model
  if ((normalizedFilter.includes('amd') || normalizedFilter.includes('radeon')) && 
      !filterHasRX && !filterHasVega) {
    return normalizedProduct.includes('amd') || 
           normalizedProduct.includes('radeon');
  }
  
  // If we get here, the specs don't match for specific models
  return false;
}


/**
 * Enhanced matcher for AMD graphics cards (Radeon series)
 * with improved support for specific model detection
 */
export const matchesAmdGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  // Check if both are talking about RX series GPUs
  const filterHasRX = filterLower.includes('rx');
  const productHasRX = productLower.includes('rx');
  
  // Check if both are talking about Vega series GPUs
  const filterHasVega = filterLower.includes('vega');
  const productHasVega = productLower.includes('vega');
  
  // Match RX series numbers (e.g., RX 580, RX 6600)
  if (filterHasRX && productHasRX) {
    const filterSeries = filterLower.match(/rx\s*(\d{3,4})/i);
    const productSeries = productLower.match(/rx\s*(\d{3,4})/i);
    
    if (filterSeries && productSeries) {
      // Match the specific series number
      return filterSeries[1] === productSeries[1];
    }
    
    // If filter has a specific RX but no number, consider it a match
    if (!filterSeries) {
      return true;
    }
    
    return false;
  }
  
  // Match Vega series numbers (e.g., Vega 8, Vega 11)
  if (filterHasVega && productHasVega) {
    const filterVega = filterLower.match(/vega\s*(\d+)/i);
    const productVega = productLower.match(/vega\s*(\d+)/i);
    
    if (filterVega && productVega) {
      // Match the specific Vega number
      return filterVega[1] === productVega[1];
    }
    
    // If filter has Vega but no number, consider it a match
    if (!filterVega) {
      return true;
    }
    
    return false;
  }
  
  // If filter mentions "AMD Radeon Graphics" (generic integrated)
  if (filterLower.includes('amd radeon graphics') && 
      productLower.includes('amd radeon graphics') && 
      !productHasRX && !productHasVega) {
    return true;
  }
  
  // For cases where both are non-RX, non-Vega AMD graphics
  return (!filterHasRX && !filterHasVega && !productHasRX && !productHasVega);
}

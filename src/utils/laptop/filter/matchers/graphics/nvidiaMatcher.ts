
/**
 * Enhanced matcher for NVIDIA graphics cards (RTX and GTX series)
 * with improved support for specific model detection
 */
export const matchesNvidiaGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  // Check for specific architecture type
  const filterIsRTX = filterLower.includes('rtx');
  const productIsRTX = productLower.includes('rtx');
  const filterIsGTX = filterLower.includes('gtx');
  const productIsGTX = productLower.includes('gtx');
  
  // If the filter specifies an architecture (RTX/GTX), the product must match it
  if (filterIsRTX && !productIsRTX) return false;
  if (filterIsGTX && !productIsGTX) return false;
  
  // Match specific model numbers (e.g., 3070, 1650)
  const filterModelMatch = filterLower.match(/(?:rtx|gtx)\s*(\d{3,4})(?:\s*(ti|super|max-q))?/i);
  const productModelMatch = productLower.match(/(?:rtx|gtx)\s*(\d{3,4})(?:\s*(ti|super|max-q))?/i);
  
  if (filterModelMatch) {
    // Filter specifies a model number
    if (!productModelMatch) {
      // Product doesn't have a model number, so it's not a match
      return false;
    }
    
    const filterModel = filterModelMatch[1];
    const productModel = productModelMatch[1];
    
    // Match the model number
    if (filterModel !== productModel) {
      return false;
    }
    
    // If filter specifies a variant (Ti, Super, Max-Q), check if product matches
    const filterVariant = filterModelMatch[2]?.toLowerCase();
    if (filterVariant) {
      const productVariant = productModelMatch[2]?.toLowerCase();
      // If filter has a variant but product doesn't, or they don't match
      if (!productVariant || filterVariant !== productVariant) {
        return false;
      }
    }
    
    return true;
  }
  
  // Match the series number for broader matching (e.g., RTX 30xx vs RTX 40xx)
  const filterSeries = filterLower.match(/(?:rtx|gtx)\s*(\d)/i);
  const productSeries = productLower.match(/(?:rtx|gtx)\s*(\d)/i);
  
  if (filterSeries && productSeries) {
    return filterSeries[1] === productSeries[1];
  }
  
  // If filter is just "NVIDIA" or "NVIDIA GeForce" without specific model
  const isGenericNvidia = filterLower === 'nvidia' || 
                          filterLower === 'nvidia geforce' || 
                          filterLower === 'geforce';
  
  if (isGenericNvidia) {
    return productLower.includes('nvidia') || 
           productLower.includes('geforce') || 
           productLower.includes('rtx') || 
           productLower.includes('gtx');
  }
  
  // For other cases
  return true;
}

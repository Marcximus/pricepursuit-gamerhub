
/**
 * Enhanced matcher for NVIDIA graphics cards (RTX and GTX series)
 * with improved model number extraction and matching
 */
export const matchesNvidiaGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  // Normalize to remove extra spaces in model numbers
  const normalizedFilter = filterLower.replace(/\s+/g, ' ');
  const normalizedProduct = productLower.replace(/\s+/g, ' ');
  
  // Check specific architecture (RTX vs GTX)
  const filterIsRTX = normalizedFilter.includes('rtx');
  const productIsRTX = normalizedProduct.includes('rtx');
  const filterIsGTX = normalizedFilter.includes('gtx');
  const productIsGTX = normalizedProduct.includes('gtx');
  
  // If filter specifies an architecture (RTX/GTX), product must match
  if ((filterIsRTX || filterIsGTX) && !(productIsRTX === filterIsRTX && productIsGTX === filterIsGTX)) {
    return false;
  }
  
  // Match the series number with improved pattern recognition
  // e.g., RTX 3060, RTX 3060 Ti, RTX 3060 Max-Q, etc.
  const filterSeriesMatch = normalizedFilter.match(/(?:rtx|gtx)\s*(\d{1,4})(?:\s*ti|\s*super)?/i);
  const productSeriesMatch = normalizedProduct.match(/(?:rtx|gtx)\s*(\d{1,4})(?:\s*ti|\s*super)?/i);
  
  if (filterSeriesMatch) {
    // If filter specifies a model number, product must match that model or better
    // For simplicity, we just check for exact match of the model number
    if (productSeriesMatch) {
      // Compare model numbers numerically
      const filterModel = parseInt(filterSeriesMatch[1], 10);
      const productModel = parseInt(productSeriesMatch[1], 10);
      
      // Return true if models match, considering 4-digit and 3-digit model numbers
      if (filterModel === productModel) {
        return true;
      }
      
      // Special case for different model length (i.e., 3000 vs 30 series)
      if (filterModel.toString().length !== productModel.toString().length) {
        // Convert 3060 to 30 or 30 to 3000 for comparison
        const normalizedFilterModel = filterModel.toString().length === 4 ? 
          Math.floor(filterModel / 100) : filterModel * 100;
        const normalizedProductModel = productModel.toString().length === 4 ? 
          Math.floor(productModel / 100) : productModel * 100;
        
        return normalizedFilterModel === normalizedProductModel;
      }
      
      return false;
    }
    return false; // Filter has specific model but product doesn't match
  }
  
  // If filter just contains "nvidia" or "geforce" without specific model
  if (normalizedFilter.includes('nvidia') || normalizedFilter.includes('geforce')) {
    return normalizedProduct.includes('nvidia') || 
           normalizedProduct.includes('geforce') || 
           normalizedProduct.includes('rtx') || 
           normalizedProduct.includes('gtx');
  }
  
  // Enhanced MX series detection (entry-level NVIDIA GPUs)
  if (normalizedFilter.includes('mx') && normalizedProduct.includes('mx')) {
    // Extract MX model numbers if present
    const filterMxMatch = normalizedFilter.match(/mx\s*(\d{3})/i);
    const productMxMatch = normalizedProduct.match(/mx\s*(\d{3})/i);
    
    if (filterMxMatch && productMxMatch) {
      return filterMxMatch[1] === productMxMatch[1];
    }
    
    // If both just mention MX without specific models
    return true;
  }
  
  // Generic case - both don't have specific model info but are NVIDIA
  return (normalizedFilter.includes('nvidia') === normalizedProduct.includes('nvidia')) &&
         (normalizedFilter.includes('geforce') === normalizedProduct.includes('geforce'));
}

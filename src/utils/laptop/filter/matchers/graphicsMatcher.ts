
import { normalizeGraphics, getGraphicsFilterValue } from "@/utils/laptop/normalizers/graphicsNormalizer";

/**
 * Matcher for graphics card filter values with improved accuracy
 */
export const matchesGraphicsFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Normalize both filter and product values for consistency
  const normalizedProduct = normalizeGraphics(productValue);
  
  // Get category-based filter values for better matching
  const productFilterValue = getGraphicsFilterValue(normalizedProduct);
  
  // Primary case: direct category match
  if (productFilterValue.toLowerCase() === filterValue.toLowerCase()) {
    return true;
  }
  
  // Secondary case: more detailed checking
  const productLower = normalizedProduct.toLowerCase();
  const filterLower = filterValue.toLowerCase();
  
  // NVIDIA discrete GPU matching
  if ((filterLower.includes('rtx') || filterLower.includes('gtx')) &&
      (productLower.includes('rtx') || productLower.includes('gtx'))) {
      
    const filterIsRTX = filterLower.includes('rtx');
    const productIsRTX = productLower.includes('rtx');
    
    // Must match the specific architecture (RTX vs GTX)
    if (filterIsRTX !== productIsRTX) {
      return false;
    }
    
    // Match the series number (e.g., RTX 30xx vs RTX 40xx)
    const filterSeries = filterLower.match(/(?:rtx|gtx)\s*(\d)/i);
    const productSeries = productLower.match(/(?:rtx|gtx)\s*(\d)/i);
    
    if (filterSeries && productSeries) {
      return filterSeries[1] === productSeries[1];
    }
    
    return true;
  }
  
  // Intel integrated graphics
  if (filterLower.includes('intel') && productLower.includes('intel')) {
    const graphicsTypes = ['iris xe', 'iris', 'uhd', 'hd'];
    for (const type of graphicsTypes) {
      if (filterLower.includes(type) !== productLower.includes(type)) {
        return false;
      }
    }
    return true;
  }
  
  // AMD graphics
  if (filterLower.includes('radeon') && productLower.includes('radeon')) {
    const filterHasRX = filterLower.includes('rx');
    const productHasRX = productLower.includes('rx');
    
    if (filterHasRX && productHasRX) {
      const filterSeries = filterLower.match(/rx\s*(\d)/i);
      const productSeries = productLower.match(/rx\s*(\d)/i);
      
      if (filterSeries && productSeries) {
        return filterSeries[1] === productSeries[1];
      }
      return true;
    }
    return !filterHasRX && !productHasRX;
  }
  
  // Apple integrated graphics
  if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
      (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
    return (filterLower.includes('m1') && productLower.includes('m1')) ||
           (filterLower.includes('m2') && productLower.includes('m2')) ||
           (filterLower.includes('m3') && productLower.includes('m3'));
  }
  
  // Reject vague or meaningless graphics terms
  if (filterLower === 'graphics' || filterLower === 'gpu' || 
      filterLower === 'integrated' || filterLower === 'dedicated' || 
      filterLower === '32-core') {
    return false;
  }
  
  // Match by major GPU brand terms
  const gpuBrands = ['nvidia', 'amd', 'radeon', 'intel', 'apple', 'rtx', 'gtx'];
  const sharesBrand = gpuBrands.some(brand => 
    filterLower.includes(brand) && productLower.includes(brand)
  );
  
  // If it shares a brand term and all filter words are in the product
  const filterWords = filterLower.split(/\s+/);
  return sharesBrand && filterWords.every(word => productLower.includes(word));
};

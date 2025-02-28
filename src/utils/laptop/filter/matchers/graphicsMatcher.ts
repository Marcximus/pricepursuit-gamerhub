
import { normalizeGraphics, getGraphicsFilterValue } from "@/utils/laptop/normalizers/graphicsNormalizer";

/**
 * Matcher for graphics card filter values with improved accuracy for specific models
 */
export const matchesGraphicsFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Normalize both filter and product values for consistency
  const normalizedFilter = normalizeGraphics(filterValue);
  const normalizedProduct = normalizeGraphics(productValue);
  
  // Skip matching if the normalized product value is excessively long (likely invalid)
  if (normalizedProduct.length > 50) {
    return false;
  }
  
  // Log for debugging
  console.log('Graphics matching:', { 
    filter: filterValue,
    normalizedFilter,
    product: productValue,
    normalizedProduct
  });
  
  // Check for specific model number match - this handles cases like "RTX 4060"
  const filterModelMatch = normalizedFilter.match(/\b(rtx|gtx)\s+(\d{4})\b/i);
  const productModelMatch = normalizedProduct.match(/\b(rtx|gtx)\s+(\d{4})\b/i);
  
  if (filterModelMatch && productModelMatch) {
    const [, filterPrefix, filterModel] = filterModelMatch;
    const [, productPrefix, productModel] = productModelMatch;
    
    // Both prefix (RTX/GTX) and model number must match
    const prefixMatch = filterPrefix.toLowerCase() === productPrefix.toLowerCase();
    const modelMatch = filterModel === productModel;
    
    if (prefixMatch && modelMatch) {
      // If filter mentions memory size (e.g., "8GB GDDR6"), check for that too
      const filterMemMatch = normalizedFilter.match(/\b(\d+)\s*GB\b/i);
      if (filterMemMatch) {
        const filterMemSize = filterMemMatch[1];
        const productMemMatch = normalizedProduct.match(/\b(\d+)\s*GB\b/i);
        
        // If product specifies memory size, it must match the filter
        if (productMemMatch) {
          return productMemMatch[1] === filterMemSize;
        }
        
        // If product doesn't specify memory but everything else matches, consider it a match
        return true;
      }
      
      // No memory size in filter, but GPU model matches
      return true;
    }
    
    return false;
  }
  
  // Get category-based filter values for broader matching when specific model matching fails
  const filterCategory = getGraphicsFilterValue(normalizedFilter);
  const productCategory = getGraphicsFilterValue(normalizedProduct);
  
  // If both can be categorized, use category matching
  if (filterCategory && productCategory) {
    return filterCategory.toLowerCase() === productCategory.toLowerCase();
  }
  
  // Fall back to simplified word matching for edge cases
  // This is less strict but helps with non-standard descriptions
  const filterWords = normalizedFilter.toLowerCase().split(/\s+/).filter(Boolean);
  const productWords = normalizedProduct.toLowerCase().split(/\s+/).filter(Boolean);
  
  // For short filters (1-2 words), require all words to be present
  if (filterWords.length <= 2) {
    return filterWords.every(word => 
      productWords.some(prodWord => prodWord.includes(word) || word.includes(prodWord))
    );
  }
  
  // For longer filters, require at least 70% of words to match
  const matchCount = filterWords.filter(word => 
    productWords.some(prodWord => prodWord.includes(word) || word.includes(prodWord))
  ).length;
  
  const matchRatio = matchCount / filterWords.length;
  return matchRatio >= 0.7;
};

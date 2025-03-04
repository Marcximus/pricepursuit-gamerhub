
/**
 * Enhanced matcher for Apple Silicon integrated graphics
 * with improved variant detection and matching
 */
export const matchesAppleGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  // Normalize to remove extra spaces
  const normalizedFilter = filterLower.replace(/\s+/g, ' ');
  const normalizedProduct = productLower.replace(/\s+/g, ' ');
  
  // Check for M-series chips by generation (M1, M2, M3, M4)
  const filterM1 = normalizedFilter.includes('m1');
  const productM1 = normalizedProduct.includes('m1');
  
  const filterM2 = normalizedFilter.includes('m2');
  const productM2 = normalizedProduct.includes('m2');
  
  const filterM3 = normalizedFilter.includes('m3');
  const productM3 = normalizedProduct.includes('m3');
  
  const filterM4 = normalizedFilter.includes('m4');
  const productM4 = normalizedProduct.includes('m4');
  
  // If filter specifies a specific M-series generation, match only that
  if ((filterM1 || filterM2 || filterM3 || filterM4) && 
      !(productM1 === filterM1 && productM2 === filterM2 && 
        productM3 === filterM3 && productM4 === filterM4)) {
    return false;
  }
  
  // Check for specific variants (Pro, Max, Ultra)
  const filterPro = normalizedFilter.includes('pro');
  const productPro = normalizedProduct.includes('pro');
  
  const filterMax = normalizedFilter.includes('max');
  const productMax = normalizedProduct.includes('max');
  
  const filterUltra = normalizedFilter.includes('ultra');
  const productUltra = normalizedProduct.includes('ultra');
  
  // If filter specifies a specific variant, match only that
  if ((filterPro || filterMax || filterUltra) && 
      !(productPro === filterPro && productMax === filterMax && productUltra === filterUltra)) {
    return false;
  }
  
  // Check for core count mentions
  const filterCoreMatch = normalizedFilter.match(/(\d+)[\s-]core/i);
  const productCoreMatch = normalizedProduct.match(/(\d+)[\s-]core/i);
  
  if (filterCoreMatch && productCoreMatch) {
    const filterCores = parseInt(filterCoreMatch[1], 10);
    const productCores = parseInt(productCoreMatch[1], 10);
    
    // Compare core counts (exact match)
    return filterCores === productCores;
  }
  
  // If filter specifies a core count but product doesn't
  if (filterCoreMatch && !productCoreMatch) {
    return false;
  }
  
  // Match "with X-core GPU" pattern
  if (normalizedFilter.includes('with') && normalizedProduct.includes('with')) {
    const filterWithCore = normalizedFilter.match(/with\s+(\d+)[\s-]core/i);
    const productWithCore = normalizedProduct.match(/with\s+(\d+)[\s-]core/i);
    
    if (filterWithCore && productWithCore) {
      return filterWithCore[1] === productWithCore[1];
    }
  }
  
  // If filter is "Apple GPU" or similar generic term
  if ((normalizedFilter === 'apple gpu' || normalizedFilter === 'apple graphics') &&
      (normalizedProduct.includes('apple') && 
       (normalizedProduct.includes('gpu') || normalizedProduct.includes('graphics')))) {
    return true;
  }
  
  // For cases when filter just mentions Apple M-series
  if (normalizedFilter.includes('apple') && 
      (filterM1 || filterM2 || filterM3 || filterM4) &&
      normalizedProduct.includes('apple') && 
      (productM1 || productM2 || productM3 || productM4)) {
    return true;
  }
  
  return false;
}


/**
 * Enhanced matcher for Intel graphics solutions
 * with improved model detection and matching
 */
export const matchesIntelGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  // Normalize to remove extra spaces
  const normalizedFilter = filterLower.replace(/\s+/g, ' ');
  const normalizedProduct = productLower.replace(/\s+/g, ' ');
  
  // Special case: if filter is just "Intel Graphics", match any Intel graphics
  if (normalizedFilter === 'intel graphics') {
    return normalizedProduct.includes('intel') && 
           normalizedProduct.includes('graphics');
  }
  
  // Check for Intel Arc discrete GPUs
  const filterHasArc = normalizedFilter.includes('arc');
  const productHasArc = normalizedProduct.includes('arc');
  
  if (filterHasArc && productHasArc) {
    // Extract Arc model numbers if present
    const filterArcMatch = normalizedFilter.match(/arc\s*([a-z]?\d{3})/i);
    const productArcMatch = normalizedProduct.match(/arc\s*([a-z]?\d{3})/i);
    
    if (filterArcMatch && productArcMatch) {
      return filterArcMatch[1].toLowerCase() === productArcMatch[1].toLowerCase();
    }
    
    // If one has a model number but the other doesn't, they don't match exactly
    if (filterArcMatch || productArcMatch) {
      return false;
    }
    
    // Both have Arc but no specific models, so match
    return true;
  }
  
  // Check for Iris Xe graphics
  const filterHasIrisXe = normalizedFilter.includes('iris xe');
  const productHasIrisXe = normalizedProduct.includes('iris xe');
  
  if (filterHasIrisXe && productHasIrisXe) {
    return true;
  }
  
  // Check for Iris Plus/Pro graphics
  const filterHasIris = normalizedFilter.includes('iris') && 
                        !normalizedFilter.includes('iris xe');
  const productHasIris = normalizedProduct.includes('iris') && 
                         !normalizedProduct.includes('iris xe');
  
  if (filterHasIris && productHasIris) {
    return true;
  }
  
  // Check for UHD Graphics
  const filterHasUHD = normalizedFilter.includes('uhd');
  const productHasUHD = normalizedProduct.includes('uhd');
  
  if (filterHasUHD && productHasUHD) {
    // Extract UHD generation numbers if present
    const filterUhdMatch = normalizedFilter.match(/uhd\s*(\d+)/i);
    const productUhdMatch = normalizedProduct.match(/uhd\s*(\d+)/i);
    
    if (filterUhdMatch && productUhdMatch) {
      return filterUhdMatch[1] === productUhdMatch[1];
    }
    
    // If one has a generation number but the other doesn't, accept broader match
    return true;
  }
  
  // Check for HD Graphics
  const filterHasHD = normalizedFilter.includes('hd graphics');
  const productHasHD = normalizedProduct.includes('hd graphics');
  
  if (filterHasHD && productHasHD) {
    return true;
  }
  
  // If filter contains "intel" but no specific model
  if (normalizedFilter.includes('intel') && 
      normalizedFilter.includes('graphics') &&
      !filterHasArc && !filterHasIrisXe && !filterHasIris && !filterHasUHD && !filterHasHD) {
    return normalizedProduct.includes('intel') && 
           normalizedProduct.includes('graphics');
  }
  
  return false;
}


/**
 * Matcher for brand filter values
 */
export const matchesBrandFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  const normalizedFilterValue = filterValue.toLowerCase();
  const normalizedProductValue = productValue.toLowerCase();
  
  // Direct brand matching
  if (normalizedProductValue === normalizedFilterValue) {
    return true;
  }
  
  // Brand might be part of the value
  if (normalizedProductValue.includes(normalizedFilterValue)) {
    return true;
  }
  
  // Check product title as fallback (brands are usually prominently mentioned in titles)
  if (productTitle && productTitle.toLowerCase().includes(normalizedFilterValue)) {
    return true;
  }
  
  // Handle common brand aliases
  if (normalizedFilterValue === 'hp' && normalizedProductValue.includes('hewlett packard')) {
    return true;
  }
  
  if (normalizedFilterValue === 'ibm' && normalizedProductValue.includes('lenovo')) {
    return true;
  }
  
  return false;
};

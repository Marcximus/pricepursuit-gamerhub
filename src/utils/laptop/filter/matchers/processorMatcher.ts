
/**
 * Matcher for processor filter values
 */
export const matchesProcessorFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  const normalizedFilterValue = filterValue.toLowerCase();
  const normalizedProductValue = productValue.toLowerCase();
  
  // Basic processor matching
  if (normalizedProductValue.includes(normalizedFilterValue)) {
    return true;
  }
  
  // Check product title as fallback
  if (productTitle && productTitle.toLowerCase().includes(normalizedFilterValue)) {
    return true;
  }
  
  // Handle common processor naming differences
  if (normalizedFilterValue.includes('i5') && normalizedProductValue.includes('i-5')) {
    return true;
  }
  
  if (normalizedFilterValue.includes('i7') && normalizedProductValue.includes('i-7')) {
    return true;
  }
  
  if (normalizedFilterValue.includes('i9') && normalizedProductValue.includes('i-9')) {
    return true;
  }
  
  return false;
};

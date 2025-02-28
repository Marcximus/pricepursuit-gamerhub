
/**
 * Matcher for graphics card filter values
 */
export const matchesGraphicsFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  const normalizedFilterValue = filterValue.toLowerCase();
  const normalizedProductValue = productValue.toLowerCase();
  
  // Basic graphics matching
  if (normalizedProductValue.includes(normalizedFilterValue)) {
    return true;
  }
  
  // Check product title as fallback
  if (productTitle && productTitle.toLowerCase().includes(normalizedFilterValue)) {
    return true;
  }
  
  // Handle RTX/GTX naming variations
  if (
    (normalizedFilterValue.includes('rtx') && normalizedProductValue.includes('geforce rtx')) ||
    (normalizedFilterValue.includes('gtx') && normalizedProductValue.includes('geforce gtx'))
  ) {
    return true;
  }
  
  // Handle integrated graphics naming variations
  if (
    (normalizedFilterValue.includes('intel') && normalizedProductValue.includes('integrated')) ||
    (normalizedFilterValue.includes('integrated') && normalizedProductValue.includes('intel'))
  ) {
    return true;
  }
  
  return false;
};

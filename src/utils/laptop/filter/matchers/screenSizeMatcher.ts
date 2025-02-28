
/**
 * Matcher for screen size filter values with improved accuracy
 */
export const matchesScreenSizeFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Extract numeric values from the strings
  const filterMatch = filterValue.match(/(\d+\.?\d*)["']?/);
  const productMatch = productValue.match(/(\d+\.?\d*)["']?/);
  
  if (!filterMatch || !productMatch) return false;
  
  const filterSize = parseFloat(filterMatch[1]);
  const productSize = parseFloat(productMatch[1]);
  
  // Screen sizes should match precisely for filtering purposes
  // With a small tolerance for rounding errors
  return Math.abs(filterSize - productSize) < 0.1;
};

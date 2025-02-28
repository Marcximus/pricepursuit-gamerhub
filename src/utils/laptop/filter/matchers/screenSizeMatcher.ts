
/**
 * Matcher for screen size filter values
 */
export const matchesScreenSizeFilter = (
  filterValue: string,
  productValue: string | null | undefined
): boolean => {
  if (!productValue) return false;
  
  // Extract numeric values from the strings
  const filterMatch = filterValue.match(/(\d+\.?\d*)["']?/);
  const productMatch = productValue.match(/(\d+\.?\d*)["']?/);
  
  if (!filterMatch || !productMatch) return false;
  
  const filterSize = parseFloat(filterMatch[1]);
  const productSize = parseFloat(productMatch[1]);
  
  // Screen sizes should match precisely for filtering purposes
  return Math.abs(filterSize - productSize) < 0.1; // Allow a small tolerance for rounding errors
};

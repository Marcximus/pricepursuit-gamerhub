
/**
 * Parses screen size value from string to number in inches
 */
export const parseScreenSize = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

/**
 * Checks if a screen size filter value matches a product screen size value
 */
export const matchesScreenSizeFilter = (filterValue: string, productValue: string): boolean => {
  const productSize = parseScreenSize(productValue);
  const filterSize = parseScreenSize(filterValue);
  
  // Enforce realistic screen sizes for laptops
  if (productSize < 10 || productSize > 21 || filterSize < 10 || filterSize > 21) {
    return false;
  }
  
  // More precise matching for screen sizes (within 0.05")
  return Math.abs(productSize - filterSize) < 0.05;
};

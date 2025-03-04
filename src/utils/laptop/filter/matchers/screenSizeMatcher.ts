

/**
 * Matcher for screen size filter values with improved accuracy
 * Now handles grouped screen size ranges
 */
export const matchesScreenSizeFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue) return false;
  
  // Extract the minimum size from filter (e.g. "15.0" +" → 15.0)
  const filterMatch = filterValue.match(/(\d+\.?\d*)/);
  if (!filterMatch) return false;
  const filterMinSize = parseFloat(filterMatch[1]);
  
  // Extract the actual size from product
  const productMatch = productValue.match(/(\d+\.?\d*)/);
  if (!productMatch) return false;
  const productSize = parseFloat(productMatch[1]);
  
  // For grouped categories, product size should be >= the minimum size 
  // and < the next category size (or any size if it's the largest category)
  if (filterValue === '18.0" +') {
    return productSize >= 18.0;
  } else if (filterValue === '17.0" +') {
    return productSize >= 17.0 && productSize < 18.0;
  } else if (filterValue === '16.0" +') {
    return productSize >= 16.0 && productSize < 17.0;
  } else if (filterValue === '15.0" +') {
    return productSize >= 15.0 && productSize < 16.0;
  } else if (filterValue === '14.0" +') {
    return productSize >= 14.0 && productSize < 15.0;
  } else if (filterValue === '13.0" +') {
    return productSize >= 13.0 && productSize < 14.0;
  } else if (filterValue === '12.0" +') {
    return productSize >= 12.0 && productSize < 13.0;
  } else if (filterValue === '11.0" +') {
    return productSize >= 11.0 && productSize < 12.0;
  } else if (filterValue === '10.0" +') {
    return productSize >= 10.0 && productSize < 11.0;
  }
  
  // Fallback for any other format - exact match with small tolerance
  return Math.abs(filterMinSize - productSize) < 0.1;
};


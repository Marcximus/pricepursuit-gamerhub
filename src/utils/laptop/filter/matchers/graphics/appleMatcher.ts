
/**
 * Matcher for Apple integrated graphics (M-series)
 */
export const matchesAppleGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  return (filterLower.includes('m1') && productLower.includes('m1')) ||
         (filterLower.includes('m2') && productLower.includes('m2')) ||
         (filterLower.includes('m3') && productLower.includes('m3'));
}

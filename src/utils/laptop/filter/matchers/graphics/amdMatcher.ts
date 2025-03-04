
/**
 * Matcher for AMD graphics cards (Radeon series)
 */
export const matchesAmdGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  const filterHasRX = filterLower.includes('rx');
  const productHasRX = productLower.includes('rx');
  
  if (filterHasRX && productHasRX) {
    const filterSeries = filterLower.match(/rx\s*(\d)/i);
    const productSeries = productLower.match(/rx\s*(\d)/i);
    
    if (filterSeries && productSeries) {
      return filterSeries[1] === productSeries[1];
    }
    return true;
  }
  return !filterHasRX && !productHasRX;
}

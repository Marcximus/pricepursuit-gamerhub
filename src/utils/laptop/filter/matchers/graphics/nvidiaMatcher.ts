
/**
 * Matcher for NVIDIA graphics cards (RTX and GTX series)
 */
export const matchesNvidiaGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  const filterIsRTX = filterLower.includes('rtx');
  const productIsRTX = productLower.includes('rtx');
  
  // Must match the specific architecture (RTX vs GTX)
  if (filterIsRTX !== productIsRTX) {
    return false;
  }
  
  // Match the series number (e.g., RTX 30xx vs RTX 40xx)
  const filterSeries = filterLower.match(/(?:rtx|gtx)\s*(\d)/i);
  const productSeries = productLower.match(/(?:rtx|gtx)\s*(\d)/i);
  
  if (filterSeries && productSeries) {
    return filterSeries[1] === productSeries[1];
  }
  
  return true;
}

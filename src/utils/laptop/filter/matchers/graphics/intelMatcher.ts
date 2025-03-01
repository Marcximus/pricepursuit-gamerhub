
/**
 * Matcher for Intel integrated graphics
 */
export const matchesIntelGraphics = (
  filterLower: string,
  productLower: string
): boolean => {
  const graphicsTypes = ['iris xe', 'iris', 'uhd', 'hd'];
  for (const type of graphicsTypes) {
    if (filterLower.includes(type) !== productLower.includes(type)) {
      return false;
    }
  }
  return true;
}

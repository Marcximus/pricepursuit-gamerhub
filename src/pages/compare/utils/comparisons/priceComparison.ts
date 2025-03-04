
// Format prices consistently
export const formatPrice = (price: number | null | undefined): string => {
  if (!price) return 'N/A';
  return `$${price.toFixed(2)}`;
};

export const comparePrices = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Lower price is better
  const aPrice = parseFloat(a.replace('$', ''));
  const bPrice = parseFloat(b.replace('$', ''));
  
  if (aPrice < bPrice) return 'better';
  if (aPrice > bPrice) return 'worse';
  return 'equal';
};

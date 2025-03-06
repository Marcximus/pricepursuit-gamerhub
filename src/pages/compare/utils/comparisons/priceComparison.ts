
// Format prices consistently
export const formatPrice = (price: number | null | undefined): string => {
  if (!price) return 'Availability Unknown';
  return `$ ${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export const comparePrices = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Handle "Availability Unknown" cases
  if (a === 'Availability Unknown' || b === 'Availability Unknown') return 'unknown';
  
  // Lower price is better
  const aPrice = parseFloat(a.replace('$ ', '').replace(/,/g, ''));
  const bPrice = parseFloat(b.replace('$ ', '').replace(/,/g, ''));
  
  if (aPrice < bPrice) return 'better';
  if (aPrice > bPrice) return 'worse';
  return 'equal';
};

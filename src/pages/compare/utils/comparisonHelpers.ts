
// Helper functions for laptop comparison

// Format prices consistently
export const formatPrice = (price: number | null | undefined): string => {
  if (!price) return 'N/A';
  return `$${price.toFixed(2)}`;
};

// Define comparison functions for different laptop specs
export const compareProcessors = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Simple keyword-based comparison for processors
  const keywords = ['i9', 'i7', 'i5', 'i3', 'Ryzen 9', 'Ryzen 7', 'Ryzen 5', 'Ryzen 3', 'M3', 'M2', 'M1'];
  
  for (const keyword of keywords) {
    const aHas = a.includes(keyword);
    const bHas = b.includes(keyword);
    
    if (aHas && !bHas) return 'better';
    if (!aHas && bHas) return 'worse';
    if (aHas && bHas) return 'equal';
  }
  
  return 'unknown';
};

export const compareRAM = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Extract RAM size for comparison
  const aMatch = a.match(/(\d+)\s*GB/i);
  const bMatch = b.match(/(\d+)\s*GB/i);
  
  if (aMatch && bMatch) {
    const aSize = parseInt(aMatch[1], 10);
    const bSize = parseInt(bMatch[1], 10);
    
    if (aSize > bSize) return 'better';
    if (aSize < bSize) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};

export const compareStorage = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Convert TB to GB for comparison
  const convertToGB = (value: string) => {
    const tbMatch = value.match(/(\d+)\s*TB/i);
    if (tbMatch) return parseInt(tbMatch[1], 10) * 1000;
    
    const gbMatch = value.match(/(\d+)\s*GB/i);
    if (gbMatch) return parseInt(gbMatch[1], 10);
    
    return 0;
  };
  
  const aSize = convertToGB(a);
  const bSize = convertToGB(b);
  
  if (aSize > bSize) return 'better';
  if (aSize < bSize) return 'worse';
  return 'equal';
};

export const comparePrices = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Lower price is better
  const aPrice = parseFloat(a.replace('$', ''));
  const bPrice = parseFloat(b.replace('$', ''));
  
  if (aPrice < bPrice) return 'better';
  if (aPrice > bPrice) return 'worse';
  return 'equal';
};

export const compareRatings = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  const aMatch = a.match(/(\d+\.\d+)\/5/);
  const bMatch = b.match(/(\d+\.\d+)\/5/);
  
  if (aMatch && bMatch) {
    const aRating = parseFloat(aMatch[1]);
    const bRating = parseFloat(bMatch[1]);
    
    if (aRating > bRating) return 'better';
    if (aRating < bRating) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};

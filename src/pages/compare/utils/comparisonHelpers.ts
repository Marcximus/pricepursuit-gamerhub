
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

export const compareScreenSize = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Extract numeric values from screen size strings (e.g., "15.6" +")
  const aMatch = a.match(/(\d+\.?\d*)/);
  const bMatch = b.match(/(\d+\.?\d*)/);
  
  if (aMatch && bMatch) {
    const aSize = parseFloat(aMatch[1]);
    const bSize = parseFloat(bMatch[1]);
    
    // Larger screen is considered better
    if (aSize > bSize) return 'better';
    if (aSize < bSize) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};

export const compareResolution = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Define an order of common resolutions from lowest to highest
  const resolutionRanking = {
    'HD': 1,
    'HD+': 2,
    'FHD': 3,
    'Full HD': 3,
    '1920 x 1080': 3,
    'QHD': 4,
    '2560 x 1440': 4,
    '4K': 5,
    'UHD': 5,
    '3840 x 2160': 5,
    'Retina': 4
  };
  
  // Find the best match for each resolution
  const findRank = (res: string): number => {
    for (const [key, value] of Object.entries(resolutionRanking)) {
      if (res.includes(key)) return value;
    }
    return 0;
  };
  
  const aRank = findRank(a);
  const bRank = findRank(b);
  
  if (aRank > bRank) return 'better';
  if (aRank < bRank) return 'worse';
  if (aRank > 0 && aRank === bRank) return 'equal';
  
  return 'unknown';
};

export const compareWeight = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Extract numeric weight values (lighter is better)
  const aMatch = a.match(/(\d+\.?\d*)/);
  const bMatch = b.match(/(\d+\.?\d*)/);
  
  if (aMatch && bMatch) {
    const aWeight = parseFloat(aMatch[1]);
    const bWeight = parseFloat(bMatch[1]);
    
    // Lighter is better
    if (aWeight < bWeight) return 'better';
    if (aWeight > bWeight) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};

export const compareBatteryLife = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Extract battery life in hours
  const aMatch = a.match(/(\d+\.?\d*)/);
  const bMatch = b.match(/(\d+\.?\d*)/);
  
  if (aMatch && bMatch) {
    const aHours = parseFloat(aMatch[1]);
    const bHours = parseFloat(bMatch[1]);
    
    // Longer battery life is better
    if (aHours > bHours) return 'better';
    if (aHours < bHours) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};

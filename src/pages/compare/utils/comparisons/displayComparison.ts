
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

export const compareRefreshRate = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  const rateA = parseInt(a, 10);
  const rateB = parseInt(b, 10);
  
  if (isNaN(rateA) || isNaN(rateB)) return 'unknown';
  if (rateA > rateB) return 'better';
  if (rateA < rateB) return 'worse';
  return 'equal';
};

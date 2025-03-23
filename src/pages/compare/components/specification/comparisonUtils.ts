
/**
 * Utilities for comparing specification values
 */

// Compare scores for highlighting (where higher is better)
export const compareScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  if (a === 'Not available' || b === 'Not available') return 'unknown';
  
  const aMatch = a.match(/^(\d+(?:\.\d+)?)/);
  const bMatch = b.match(/^(\d+(?:\.\d+)?)/);
  
  if (aMatch && bMatch) {
    const aValue = parseFloat(aMatch[1]);
    const bValue = parseFloat(bMatch[1]);
    
    if (aValue > bValue) return 'better';
    if (aValue < bValue) return 'worse';
    return 'equal';
  }
  
  return 'unknown';
};

// Compare scores for highlighting (where lower is better)
export const compareInverseScores = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  if (a === 'Not available' || b === 'Not available') return 'unknown';
  
  const aMatch = a.match(/^(\d+(?:\.\d+)?)/);
  const bMatch = b.match(/^(\d+(?:\.\d+)?)/);
  
  if (aMatch && bMatch) {
    const aValue = parseFloat(aMatch[1]);
    const bValue = parseFloat(bMatch[1]);
    
    if (aValue < bValue) return 'better';  // Lower is better
    if (aValue > bValue) return 'worse';   // Higher is worse
    return 'equal';
  }
  
  return 'unknown';
};

// Compare prices (lower is better)
export const comparePrices = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  if (a === 'Not available' || b === 'Not available') return 'unknown';
  
  // Extract numeric value from price string (e.g., "$1,299.99")
  const aMatch = a.match(/[\\$£€]?\s?(\d+(?:,\d+)*(?:\.\d+)?)/);
  const bMatch = b.match(/[\\$£€]?\s?(\d+(?:,\d+)*(?:\.\d+)?)/);
  
  if (aMatch && bMatch) {
    const aValue = parseFloat(aMatch[1].replace(/,/g, ''));
    const bValue = parseFloat(bMatch[1].replace(/,/g, ''));
    
    if (aValue < bValue) return 'better';  // Lower price is better
    if (aValue > bValue) return 'worse';   // Higher price is worse
    return 'equal';
  }
  
  return 'unknown';
};

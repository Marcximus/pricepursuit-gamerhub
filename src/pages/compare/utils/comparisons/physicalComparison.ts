
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

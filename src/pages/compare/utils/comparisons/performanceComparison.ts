
// Define comparison functions for different laptop performance specs
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

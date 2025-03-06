// Define comparison functions for different laptop performance specs
export const compareProcessors = (a: string, b: string): 'better' | 'worse' | 'equal' | 'unknown' => {
  // Normalize the processor strings for comparison
  const procA = a.toLowerCase();
  const procB = b.toLowerCase();
  
  // First check for Intel Core Ultra processors - they are newer and better than regular Core i-series
  const ultraAMatch = procA.match(/ultra\s+([579])/i);
  const ultraBMatch = procB.match(/ultra\s+([579])/i);
  
  // If both are Ultra processors, compare their numbers
  if (ultraAMatch && ultraBMatch) {
    const ultraAValue = parseInt(ultraAMatch[1], 10);
    const ultraBValue = parseInt(ultraBMatch[1], 10);
    
    if (ultraAValue > ultraBValue) return 'better';
    if (ultraAValue < ultraBValue) return 'worse';
    return 'equal';
  }
  
  // If only one is Ultra, it's better than non-Ultra
  if (ultraAMatch && !ultraBMatch) return 'better';
  if (!ultraAMatch && ultraBMatch) return 'worse';
  
  // Compare processor tiers with proper hierarchy
  // Define processor tiers (higher index = better performance)
  const tiers = [
    { name: 'celeron', value: 1 },
    { name: 'pentium', value: 2 },
    { name: 'i3', value: 3 },
    { name: 'ryzen 3', value: 4 },
    { name: 'm1', value: 5 },
    { name: 'i5', value: 6 },
    { name: 'ryzen 5', value: 7 },
    { name: 'm2', value: 8 },
    { name: 'i7', value: 9 },
    { name: 'ryzen 7', value: 10 },
    { name: 'i9', value: 11 },
    { name: 'ryzen 9', value: 12 },
    { name: 'm3', value: 13 },
  ];
  
  // Find the highest tier match for each processor
  let tierA = 0;
  let tierB = 0;
  
  for (const tier of tiers) {
    if (procA.includes(tier.name)) {
      tierA = Math.max(tierA, tier.value);
    }
    if (procB.includes(tier.name)) {
      tierB = Math.max(tierB, tier.value);
    }
  }
  
  if (tierA > tierB) return 'better';
  if (tierA < tierB) return 'worse';
  if (tierA > 0 && tierA === tierB) return 'equal';
  
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

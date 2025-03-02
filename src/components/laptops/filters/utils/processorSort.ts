
/**
 * Sorts processor options in a logical order
 */
export function sortProcessorOptions(options: string[]): string[] {
  // Define the order for processor categories
  const order: Record<string, number> = {
    // Apple Silicon (newest first)
    'Apple M4': 1,
    'Apple M4 Pro': 2,
    'Apple M4 Max': 3,
    'Apple M4 Ultra': 4,
    'Apple M3': 5,
    'Apple M3 Pro': 6,
    'Apple M3 Max': 7,
    'Apple M3 Ultra': 8,
    'Apple M2': 9,
    'Apple M2 Pro': 10,
    'Apple M2 Max': 11,
    'Apple M2 Ultra': 12,
    'Apple M1': 13,
    'Apple M1 Pro': 14,
    'Apple M1 Max': 15,
    'Apple M1 Ultra': 16,
    
    // Intel Core Ultra
    'Intel Core Ultra 9': 20,
    'Intel Core Ultra 7': 21,
    'Intel Core Ultra 5': 22,
    
    // Intel Core recent gens
    'Intel Core i9 (13th/14th Gen)': 30,
    'Intel Core i7 (13th/14th Gen)': 31,
    'Intel Core i5 (13th/14th Gen)': 32,
    'Intel Core i3 (13th/14th Gen)': 33,
    
    // Intel Core previous gens
    'Intel Core i9 (11th/12th Gen)': 40,
    'Intel Core i7 (11th/12th Gen)': 41,
    'Intel Core i5 (11th/12th Gen)': 42,
    'Intel Core i3 (11th/12th Gen)': 43,
    
    'Intel Core i9 (10th Gen)': 50,
    'Intel Core i7 (10th Gen)': 51,
    'Intel Core i5 (10th Gen)': 52,
    'Intel Core i3 (10th Gen)': 53,
    
    // Generic Intel Core
    'Intel Core i9': 60,
    'Intel Core i7': 61,
    'Intel Core i5': 62,
    'Intel Core i3': 63,
    
    // AMD Ryzen
    'AMD Ryzen 9': 70,
    'AMD Ryzen 7': 71,
    'AMD Ryzen 5': 72,
    'AMD Ryzen 3': 73,
    
    // Budget options
    'Intel Celeron': 80,
    'Intel Pentium': 81,
    
    // Mobile processors
    'Qualcomm Snapdragon': 90,
    'MediaTek': 91,
    
    // Always last
    'Other Processor': 100
  };
  
  return [...options].sort((a, b) => {
    const orderA = order[a] || 999;
    const orderB = order[b] || 999;
    return orderA - orderB;
  });
}

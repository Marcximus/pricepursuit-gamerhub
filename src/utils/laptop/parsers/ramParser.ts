
/**
 * Parser utility for RAM values
 */

/**
 * Gets RAM value in GB from a string
 * More strictly validates RAM format to avoid confusion with storage
 */
export const getRamValue = (ram: string): number => {
  if (!ram) return 0;
  
  // Skip parsing if it's definitely not a RAM string
  // This helps distinguish RAM from storage/GPU memory
  if (ram.toLowerCase().includes('ssd') || 
      ram.toLowerCase().includes('hdd') || 
      ram.toLowerCase().includes('storage') ||
      ram.toLowerCase().includes('emmc') ||
      ram.toLowerCase().includes('vram') ||
      ram.toLowerCase().includes('graphics memory')) {
    return 0;
  }
  
  // Prioritize RAM patterns with RAM keywords
  const ramPatterns = [
    // RAM with DDR type (highest priority)
    /(\d+(\.\d+)?)\s*GB\s*(DDR\d*|LPDDR\d*)/i,
    
    // Explicit RAM or Memory mention
    /(\d+(\.\d+)?)\s*GB\s*(RAM|Memory)/i,
    /(\d+(\.\d+)?)\s*GB\s*of\s*(RAM|Memory)/i,
    
    // RAM/Memory mentioned first
    /(RAM|Memory|System Memory)\s*:\s*(\d+(\.\d+)?)\s*GB/i,
    
    // Generic GB pattern (lowest priority, only use if nothing else matches)
    /(\d+(\.\d+)?)\s*GB/i
  ];
  
  // Try patterns in order of priority
  for (const pattern of ramPatterns) {
    const match = ram.match(pattern);
    
    if (match) {
      // Extract the numeric value
      // For patterns where the numeric group is the first capture group
      let numValue: number;
      
      if (pattern.source.startsWith('(RAM|Memory|System')) {
        // For patterns where number is in second capture group
        numValue = parseFloat(match[2]);
      } else {
        // For patterns where number is in first capture group
        numValue = parseFloat(match[1]);
      }
      
      // Validate RAM values to be realistic for laptops
      // Typical laptop RAM: 4GB to 64GB, rarely 128GB
      // If it's outside this range, it might not be RAM
      if (numValue < 2 || numValue > 128) {
        continue; // Try next pattern
      }
      
      // If we're using the generic pattern (last one), do extra validation
      if (pattern === ramPatterns[ramPatterns.length - 1]) {
        // For generic GB patterns, we should check for common RAM sizes
        // to avoid confusion with storage
        const commonRamSizes = [4, 8, 12, 16, 24, 32, 64, 96, 128];
        const isCommonSize = commonRamSizes.some(size => 
          Math.abs(numValue - size) < 0.5 // Allow for small rounding differences
        );
        
        if (!isCommonSize) {
          continue; // Skip this match if it's not a common RAM size
        }
      }
      
      return numValue;
    }
  }
  
  // Try one more fallback for MB values (rare in modern laptops)
  const mbMatch = ram.match(/(\d+)\s*MB/i);
  if (mbMatch) {
    const mbValue = parseFloat(mbMatch[1]);
    return mbValue / 1024; // Convert to GB
  }
  
  return 0;
};

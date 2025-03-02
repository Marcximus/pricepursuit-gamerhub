
/**
 * Functions for processing and normalizing RAM information
 */

export const processRam = (ram: string | undefined, title: string, description?: string): string | undefined => {
  if (ram && typeof ram === 'string' && !ram.includes('undefined')) {
    // Clean up existing RAM string
    const cleanedRam = ram.trim().replace(/\s+/g, ' ');
    if (cleanedRam.length > 2) {
      return cleanedRam;
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for RAM in the text (more specific patterns first)
  const ramPatterns = [
    // Match specific RAM mentions with DDR type (highest priority)
    /\b(\d+)\s*GB\s*(?:DDR[345]|LPDDR[345][X]?)\s*(?:RAM|Memory)?\b/i,
    
    // Match RAM with DDR type
    /\b(\d+)\s*GB\s*(?:DDR[345]|LPDDR[345][X]?)\b/i,
    
    // Match RAM with frequency
    /\b(\d+)\s*GB\s*(?:RAM|Memory)?\s*(?:@\s*\d+\s*MHz)?\b/i,
    
    // Match generic RAM mentions
    /\b(\d+)\s*GB\s*RAM\b/i,
    /\b(\d+)\s*GB\s*Memory\b/i,
    /\bRAM:\s*(\d+)\s*GB\b/i,
    /\bMemory:\s*(\d+)\s*GB\b/i,
    
    // Match simple RAM numbers - this will catch "32GB RAM" in our example
    /\b(\d+)\s*GB\b(?=.*?\bRAM\b)/i,
    
    // Match RAM before storage (must have RAM indicator)
    /\b(\d+)\s*GB\b(?=\s*(?:RAM|Memory|DDR))/i,
  ];
  
  // Check for storage mentions to avoid confusion
  const hasStorageMention = /\b\d+\s*GB\s*(?:SSD|HDD|Storage|eMMC)\b/i.test(textToSearch);
  
  // If there are storage mentions, we need to be more careful with generic GB patterns
  const genericRamPatterns = [
    // Only use these if no storage mention or if there's clear separation
    // Match RAM mentioned early in specs - be cautious
    /\b(\d+)\s*GB\b(?!.*(?:SSD|HDD|Storage|hard\s*drive))/i,
  ];
  
  const allPatterns = hasStorageMention ? ramPatterns : [...ramPatterns, ...genericRamPatterns];
  
  for (const pattern of allPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      const ramSize = match[1];
      
      // Validate RAM size to filter out unrealistic values
      const ramSizeNum = parseInt(ramSize, 10);
      if (ramSizeNum < 2 || ramSizeNum > 128) {
        continue; // Skip unrealistic RAM values
      }
      
      // Double-check this isn't actually storage
      // Look at surrounding text for storage indicators
      const matchIndex = match.index || 0;
      const surroundingText = textToSearch.substring(
        Math.max(0, matchIndex - 20), 
        Math.min(textToSearch.length, matchIndex + match[0].length + 20)
      );
      
      // If there are storage indicators right next to this value, skip it
      if (/SSD|HDD|Storage|hard\s*drive|eMMC/i.test(surroundingText) && 
          !/RAM|Memory|DDR/i.test(surroundingText)) {
        continue;
      }
      
      // Look for DDR type
      const ddrMatch = textToSearch.match(/\b(DDR[345](?:-\d+)?|LPDDR[345][X]?)(?:\s*@\s*(\d+)\s*MHz)?\b/i);
      
      // Compose RAM string with size and optional DDR type and frequency
      if (ddrMatch) {
        const ddrType = ddrMatch[1].toUpperCase();
        const frequency = ddrMatch[2] ? ` ${ddrMatch[2]}MHz` : '';
        return `${ramSize}GB ${ddrType}${frequency}`;
      }
      
      return `${ramSize}GB`;
    }
  }
  
  // Advanced fallback: check in description for any RAM mention
  if (description) {
    const descRamMatch = description.match(/\b(?:RAM|Memory)[:\s]+(\d+)\s*GB\b/i);
    if (descRamMatch) {
      const ramSize = parseInt(descRamMatch[1], 10);
      if (ramSize >= 2 && ramSize <= 128) { // Only accept realistic RAM values
        return `${ramSize}GB`;
      }
    }
  }
  
  return undefined;
};

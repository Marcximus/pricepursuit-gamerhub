
/**
 * Processes and normalizes screen size information
 * Extracts screen size value from text and groups into size categories
 */
export const processScreenSize = (screenSize: string | undefined, title: string, description?: string): string | undefined => {
  let extractedSize: number | null = null;
  
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    // Clean up existing screen size string to remove unrelated specs
    const cleanedScreenSize = screenSize
      .replace(/\d+\s*(GB|TB)\s*(RAM|SSD|HDD|Memory|Storage)/i, '')
      .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
      .trim();
      
    if (cleanedScreenSize.length > 1) {
      const match = cleanedScreenSize.match(/(\d+\.?\d*)/);
      if (match) {
        extractedSize = parseFloat(match[1]);
      }
    }
  }
  
  // If we don't have a size yet, try to extract from title and description
  if (!extractedSize) {
    // Combine title and description for better extraction chances if description is provided
    const textToSearch = description ? `${title} ${description}` : title;
    
    // Look for screen size patterns in the text (more specific patterns first)
    // Express pattern with decimal numbers and inch keyword
    const sizePatterns = [
      // Match specific screen size with decimal + inch
      /\b(\d{1,2}(?:\.\d{1,2})?)[- ](?:inch|in|"|''|inches)\b/i,
      
      // Match screen size with just the double quote as inch indicator
      /\b(\d{1,2}(?:\.\d{1,2})?)\s*["″]\b/i,
      
      // Match screen size in the format 15.6-inch or similar
      /\b(\d{1,2}(?:\.\d{1,2})?)[- ](?:inch(?:es)?)\b/i,
      
      // Match screen size mentioned with a double quote symbol
      /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:inch(?:es)?|["″])\b/i,
      
      // Match screen size mentioned with "Screen" or "Display"
      /\b(?:screen|display)?\s*(?:size)?:?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:inch|in|"|''|inches)\b/i,
      
      // Less specific patterns (only use if more specific ones don't match)
      /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:in|inch|inches)\b/i,
      
      // Common laptop/notebook sizes - without inch keyword but at the start of text
      /^(?:notebook|laptop)\s*(\d{1,2}(?:\.\d{1,2})?)\b/i,
    ];
    
    for (const pattern of sizePatterns) {
      const match = textToSearch.match(pattern);
      if (match && match[1]) {
        const sizeValue = parseFloat(match[1]);
        
        // Validate that this looks like a realistic screen size for a laptop
        if (sizeValue >= 10 && sizeValue <= 22) {
          extractedSize = sizeValue;
          break;
        }
      }
    }
    
    // Look for common laptop screen sizes
    if (!extractedSize) {
      const commonSizes = textToSearch.match(/\b(11\.6|12\.5|13\.3|14|15\.6|16|17\.3)\b/);
      if (commonSizes && commonSizes[1]) {
        const sizeValue = parseFloat(commonSizes[1]);
        if (sizeValue >= 10 && sizeValue <= 22) {
          extractedSize = sizeValue;
        }
      }
    }
    
    // Match MacBook specific sizes
    if (!extractedSize && textToSearch.toLowerCase().includes('macbook')) {
      if (textToSearch.match(/\b(air|pro)\s*13\b/i)) extractedSize = 13.3;
      if (textToSearch.match(/\b(air|pro)\s*14\b/i)) extractedSize = 14.2;
      if (textToSearch.match(/\b(air|pro)\s*15\b/i)) extractedSize = 15.3;
      if (textToSearch.match(/\b(air|pro)\s*16\b/i)) extractedSize = 16.2;
    }
  }
  
  // Group into size categories
  if (extractedSize) {
    if (extractedSize >= 18) return '18.0" +';
    if (extractedSize >= 17) return '17.0" +';
    if (extractedSize >= 16) return '16.0" +';
    if (extractedSize >= 15) return '15.0" +';
    if (extractedSize >= 14) return '14.0" +';
    if (extractedSize >= 13) return '13.0" +';
    if (extractedSize >= 12) return '12.0" +';
    if (extractedSize >= 11) return '11.0" +';
    if (extractedSize >= 10) return '10.0" +';
  }
  
  return undefined;
};

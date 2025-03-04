
/**
 * Processes and normalizes battery life information
 */
export const processBatteryLife = (batteryLife: string | undefined, title: string, description?: string): string | undefined => {
  if (batteryLife && typeof batteryLife === 'string' && !batteryLife.includes('undefined')) {
    return batteryLife.trim();
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for battery life in the text using common battery life patterns
  const batteryPatterns = [
    // Match battery life with hours mention
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\s*(?:battery|runtime|battery life)\b/i,
    
    // Match battery life with "up to" pattern
    /\bup\s*to\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\b/i,
    
    // Match battery life with "lasts" verb
    /\bbattery\s*(?:life|runtime)?\s*(?:lasts|of)\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\b/i,
    
    // Match battery life mentioned with "battery life" or "battery"
    /\bbattery\s*(?:life|runtime)?:?\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\b/i,
    
    // More generic pattern for battery hours
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\s*(?:of|on)?\s*(?:battery|runtime)?\b/i,
  ];
  
  for (const pattern of batteryPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const hours = parseFloat(match[1]);
      
      // Validate that this looks like a realistic battery life for a laptop
      if (hours > 0 && hours <= 24) {
        return `${hours} hours`;
      }
    }
  }
  
  return undefined;
};

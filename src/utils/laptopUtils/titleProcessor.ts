
/**
 * Processes and normalizes laptop title 
 * Removes common filler words and standardizes format
 */
export const processTitle = (title: string): string => {
  if (!title) return '';
  
  // Clean up common marketing phrases and filler words
  const cleanedTitle = title
    .replace(/\b(new|newest|latest|2023|2024|model)\b/gi, '')
    .replace(/\bwith\b/gi, '')
    .replace(/[,|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
    
  return cleanedTitle;
};

/**
 * Extracts properly formatted model information from a title
 */
export const extractModelFromTitle = (title: string, brand: string): string | null => {
  if (!title || !brand) return null;
  
  const titleLower = title.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  // Skip processing if brand isn't in the title
  if (!titleLower.includes(brandLower)) return null;
  
  // Brand-specific model extraction patterns
  const brandPatterns: Record<string, RegExp[]> = {
    'apple': [/macbook\s+(air|pro)\s+(?:m[123](?:\s+(?:pro|max|ultra))?|intel)/i],
    'dell': [/\bxps\s+\d{1,2}\b/i, /\binspiron\s+\d{1,4}\b/i, /\blatitude\s+\d{1,4}\b/i],
    'hp': [/\b(?:spectre|pavilion|envy|omen)\s+(?:x360|\d{1,4}[a-z]*)\b/i],
    'lenovo': [/\b(?:thinkpad|ideapad|legion|yoga)\s+[a-z]?\d{1,4}[a-z]*\b/i],
    'asus': [/\b(?:zenbook|vivobook|rog|tuf)\s+[a-z]?\d{1,4}[a-z]*\b/i],
    'acer': [/\b(?:aspire|nitro|predator|swift)\s+[a-z]?\d{1,4}[a-z]*\b/i],
    'msi': [/\b(?:raider|stealth|titan|prestige)\s+[a-z]?\d{1,4}[a-z]*\b/i],
    'samsung': [/\bgalaxy\s+book\s+\d{1,2}\b/i, /\bodyssey\s+\d{1,2}\b/i],
    'microsoft': [/\bsurface\s+(?:pro|laptop|book|go)\s+\d{1,2}\b/i],
    'razer': [/\bblade\s+(?:\d{1,2}|stealth|pro)\b/i],
  };
  
  // Try to match brand-specific patterns first
  const patterns = brandPatterns[brandLower] || [];
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  
  // Generic fallback approach
  // Extract substring after brand and before specs
  const brandIndex = titleLower.indexOf(brandLower);
  if (brandIndex >= 0) {
    const afterBrand = title.substring(brandIndex + brandLower.length).trim();
    
    // Find first occurrence of technical spec patterns (processor, RAM, storage, etc.)
    const specPattern = /(?:\d+(?:\.\d+)?\s*(?:GB|TB|inch|"|GHz|MHz)|intel|amd|ryzen|core\s+i[3579]|nvidia|rtx|gtx|radeon)/i;
    const specMatch = afterBrand.match(specPattern);
    
    if (specMatch) {
      const endIndex = specMatch.index;
      if (endIndex && endIndex > 0) {
        const modelPart = afterBrand.substring(0, endIndex).trim();
        if (modelPart.length > 2 && modelPart.length < 30) {
          return modelPart;
        }
      }
    } else {
      // If no spec pattern found, take first part after brand (limited to reasonable model length)
      const words = afterBrand.split(' ');
      const modelWords = words.slice(0, Math.min(5, words.length));
      const potentialModel = modelWords.join(' ').trim();
      
      if (potentialModel.length > 2 && potentialModel.length < 30) {
        return potentialModel;
      }
    }
  }
  
  return null;
};


import { BRAND_PATTERNS } from './brandNormalizer';

// Model name extraction patterns for each brand
const MODEL_PATTERNS: {[key: string]: RegExp} = {
  'Apple': /MacBook\s+(Air|Pro)(?:\s+(\d+\.?\d*)")?/i,
  'Lenovo': /(?:ThinkPad|IdeaPad|Yoga|Legion)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'HP': /(?:Pavilion|Envy|Spectre|Omen|EliteBook|ProBook)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Dell': /(?:XPS|Inspiron|Latitude|Precision|Vostro)\s+(\d+)(?:[A-Z0-9]+)?/i,
  'ASUS': /(?:ZenBook|VivoBook|ROG|TUF)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Acer': /(?:Aspire|Predator|Nitro|Swift|Spin)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'MSI': /(?:Stealth|Raider|Titan|Prestige|Sword|Katana)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'LG': /(?:gram)\s+(\d+(?:\.\d+)?)/i  // Added pattern for LG gram models
};

/**
 * Extract and normalize model from title
 */
export const normalizeModel = (model: string | null, title: string, brand?: string): string => {
  if (model && model.trim() !== '') {
    // Clean up model if it's just a repeating brand name
    if (brand && model.toLowerCase() === brand.toLowerCase()) {
      model = '';
    }
    // Clean up model if it's just "Laptop"
    if (model.toLowerCase() === 'laptop') {
      model = '';
    }
    
    if (model.trim() !== '') {
      return model.trim();
    }
  }
  
  // If no model provided, try to extract from title based on brand
  if (!brand || brand === 'Unknown Brand') {
    return '';
  }
  
  const titleLower = title.toLowerCase();
  const brandLower = brand.toLowerCase();
  
  switch (brandLower) {
    case 'apple':
      if (titleLower.includes('macbook')) {
        // Extract MacBook model (Air, Pro, etc.)
        const macbookMatch = title.match(/MacBook\s+(Air|Pro)(\s+\d+\.\d+")?/i);
        return macbookMatch ? macbookMatch[0] : '';
      }
      break;
      
    case 'dell':
      // Extract Dell model (XPS, Inspiron, etc.)
      const dellMatch = title.match(/\b(XPS|Inspiron|Latitude|Precision)\s+\d+/i);
      return dellMatch ? dellMatch[0] : '';
      
    case 'hp':
      // Extract HP model (Spectre, Pavilion, Envy, etc.)
      const hpMatch = title.match(/\b(Spectre|Pavilion|Envy|Omen|EliteBook)\s+\w+(-\w+)?/i);
      return hpMatch ? hpMatch[0] : '';
      
    case 'lenovo':
      // Extract Lenovo model (ThinkPad, IdeaPad, Yoga, etc.)
      const lenovoMatch = title.match(/\b(ThinkPad|IdeaPad|Yoga|Legion)\s+\w+(-\w+)?/i);
      return lenovoMatch ? lenovoMatch[0] : '';
      
    case 'asus':
      // Extract ASUS model (ZenBook, ROG, VivoBook, etc.)
      const asusMatch = title.match(/\b(ZenBook|ROG|VivoBook|TUF)\s+\w+(-\w+)?/i);
      return asusMatch ? asusMatch[0] : '';
      
    case 'lg':
      // Extract LG gram model with screen size
      const lgGramMatch = title.match(/\bgram\s+(\d+(?:\.\d+)?)(?:"|inch)?/i);
      if (lgGramMatch) {
        return `Gram ${lgGramMatch[1]}"`;
      }
      
      // Try to extract model code for LG
      const lgModelMatch = title.match(/\b(Z\d+[A-Z]+\d+[A-Z]*\d*)/i);
      if (lgModelMatch) {
        return lgModelMatch[1];
      }
      break;
      
    case 'microsoft':
      // Extract Surface models
      const surfaceMatch = title.match(/\b(Surface\s+(?:Pro|Go|Laptop|Book|Studio))\s*(\d+)?/i);
      if (surfaceMatch) {
        return surfaceMatch[2] ? `${surfaceMatch[1]} ${surfaceMatch[2]}` : surfaceMatch[1];
      }
      break;
      
    default:
      // Generic model extraction for other brands
      // Try to find model after brand name
      const brandIdx = titleLower.indexOf(brandLower);
      if (brandIdx >= 0) {
        const afterBrand = title.substring(brandIdx + brandLower.length).trim();
        // Look for alphanumeric model designations
        const modelMatch = afterBrand.match(/^[:\s-]*([A-Z0-9]+-?[A-Z0-9]+)/i);
        if (modelMatch) {
          return modelMatch[1];
        }
      }
      return '';
  }
  
  return '';
};

export { MODEL_PATTERNS };

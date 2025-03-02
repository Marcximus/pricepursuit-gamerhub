
import { BRAND_PATTERNS } from './brandNormalizer';

// Model name extraction patterns for each brand
const MODEL_PATTERNS: {[key: string]: RegExp} = {
  'Apple': /MacBook\s+(Air|Pro)(?:\s+(\d+\.?\d*)")?/i,
  'Lenovo': /(?:ThinkPad|IdeaPad|Yoga|Legion)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'HP': /(?:Pavilion|Envy|Spectre|Omen|EliteBook|ProBook)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Dell': /(?:XPS|Inspiron|Latitude|Precision|Vostro)\s+(\d+)(?:[A-Z0-9]+)?/i,
  'ASUS': /(?:ZenBook|VivoBook|ROG|TUF)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Acer': /(?:Aspire|Predator|Nitro|Swift|Spin)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'MSI': /(?:Stealth|Raider|Titan|Prestige|Sword|Katana)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i
};

// Cache for model normalization results
const modelNormalizationCache = new Map<string, string>();

/**
 * Extract and normalize model from title with caching
 */
export const normalizeModel = (model: string | null, title: string, brand?: string): string => {
  // Use the input as a cache key
  const cacheKey = `${model || ''}|${title}|${brand || ''}`;
  
  // Check if we have a cached result
  if (modelNormalizationCache.has(cacheKey)) {
    return modelNormalizationCache.get(cacheKey)!;
  }
  
  let result = '';
  
  if (model && model.trim() !== '') {
    result = model.trim();
  } else if (brand && brand !== 'Unknown Brand') {
    // If no model provided, try to extract from title based on brand
    const titleLower = title.toLowerCase();
    const brandLower = brand.toLowerCase();
    
    switch (brandLower) {
      case 'apple':
        if (titleLower.includes('macbook')) {
          const macbookMatch = title.match(/MacBook\s+(Air|Pro)(\s+\d+\.\d+")?/i);
          result = macbookMatch ? macbookMatch[0] : '';
        }
        break;
        
      case 'dell':
        const dellMatch = title.match(/\b(XPS|Inspiron|Latitude|Precision)\s+\d+/i);
        result = dellMatch ? dellMatch[0] : '';
        break;
        
      case 'hp':
        const hpMatch = title.match(/\b(Spectre|Pavilion|Envy|Omen|EliteBook)\s+\w+(-\w+)?/i);
        result = hpMatch ? hpMatch[0] : '';
        break;
        
      case 'lenovo':
        const lenovoMatch = title.match(/\b(ThinkPad|IdeaPad|Yoga|Legion)\s+\w+(-\w+)?/i);
        result = lenovoMatch ? lenovoMatch[0] : '';
        break;
        
      case 'asus':
        const asusMatch = title.match(/\b(ZenBook|ROG|VivoBook|TUF)\s+\w+(-\w+)?/i);
        result = asusMatch ? asusMatch[0] : '';
        break;
        
      default:
        result = '';
    }
  }
  
  // Cache the result
  modelNormalizationCache.set(cacheKey, result);
  return result;
};

export { MODEL_PATTERNS };

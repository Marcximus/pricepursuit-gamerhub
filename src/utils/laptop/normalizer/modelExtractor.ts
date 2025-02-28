/**
 * Utility functions to extract model information from laptop titles
 */

import { normalizeBrand } from './brandNormalizer';

// Common words that should be excluded from model identification
const COMMON_WORDS = new Set([
  'laptop', 'notebook', 'computer', 'pc', 'new', 'latest', 'inch', 'display',
  'screen', 'with', 'and', 'for', 'the', 'gen', 'generation', 'series',
  'premium', 'professional', 'student', 'gaming', 'business', 'home',
  'touchscreen', 'touch', 'screen', 'windows', 'mac', 'macos', 'os', 'ssd', 'hdd',
  'ram', 'memory', 'storage', 'processor', 'cpu', 'core', 'amd', 'intel', 'nvidia',
  'geforce', 'radeon', 'graphics', 'card', 'webcam', 'camera', 'bluetooth', 'wifi',
  'backlit', 'keyboard', 'fingerprint', 'reader', 'usb', 'type-c', 'hdmi', 'port',
  'ports', 'battery', 'life', 'lightweight', 'slim', 'thin', 'powerful', 'fast'
]);

/**
 * Brand-specific patterns to extract model information
 */
const BRAND_MODEL_PATTERNS: {[key: string]: RegExp[]} = {
  'Apple': [
    /MacBook (Air|Pro) (\d+[\.\d]*-inch|M[1-3])(?: ?\(.*?\))?/i,
    /MacBook (Air|Pro)(?: ?\(.*?\))?/i
  ],
  'Dell': [
    /Dell (XPS|Inspiron|Latitude|Precision|Vostro|G Series|Alienware) (\d+)(?:[^\d]|$)/i,
    /Dell (XPS|Inspiron|Latitude|Precision|Vostro|G Series|Alienware)/i
  ],
  'HP': [
    /HP (Spectre|Pavilion|Envy|Omen|EliteBook|ProBook|ZBook|Victus) (\d+)[^\d]?/i,
    /HP (Spectre|Pavilion|Envy|Omen|EliteBook|ProBook|ZBook|Victus)/i
  ],
  'Lenovo': [
    /Lenovo (ThinkPad|IdeaPad|Yoga|Legion|ThinkBook) ([A-Z]?\d+[a-z]?(?:-\d+)?)/i,
    /Lenovo (ThinkPad|IdeaPad|Yoga|Legion|ThinkBook)/i,
    /Lenovo ([A-Z]?\d+[a-z]?(?:-\d+)?)/i
  ],
  'ASUS': [
    /ASUS (ZenBook|VivoBook|TUF Gaming|ROG Strix|ROG Zephyrus|ExpertBook|ProArt) ([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
    /ASUS (ZenBook|VivoBook|TUF Gaming|ROG Strix|ROG Zephyrus|ExpertBook|ProArt)/i
  ],
  'Acer': [
    /Acer (Aspire|Nitro|Predator|Swift|Spin|Chromebook) (\d+)[^\d]?/i,
    /Acer (Aspire|Nitro|Predator|Swift|Spin|Chromebook)/i
  ],
  'MSI': [
    /MSI (GF|GS|GP|GT|GL|GE|Stealth|Raider|Creator|Prestige|Modern|Sword|Katana) (\d+[A-Z]?(?:-\d+)?)/i,
    /MSI (GF|GS|GP|GT|GL|GE|Stealth|Raider|Creator|Prestige|Modern|Sword|Katana)/i
  ],
  'Samsung': [
    /Samsung (Galaxy Book|Notebook|Odyssey) (\d+)[^\d]?/i,
    /Samsung (Galaxy Book|Notebook|Odyssey)/i
  ],
  'Microsoft': [
    /Microsoft Surface (Pro|Laptop|Book|Go|Studio) (\d+)/i,
    /Microsoft Surface (Pro|Laptop|Book|Go|Studio)/i
  ],
  'Razer': [
    /Razer Blade (\d+|Stealth|Pro)(?: ?\(.*?\))?/i,
    /Razer Blade/i
  ]
};

/**
 * Extracts model information from a laptop title based on its brand
 */
export function extractModel(title: string, brand?: string): string {
  if (!title) return '';
  
  // First, ensure we have the correct brand
  const detectedBrand = normalizeBrand(brand || '', title);
  
  // If we have brand-specific patterns, use them
  if (detectedBrand && BRAND_MODEL_PATTERNS[detectedBrand]) {
    for (const pattern of BRAND_MODEL_PATTERNS[detectedBrand]) {
      const match = title.match(pattern);
      if (match) {
        // If the pattern has a capture group for the model, use it
        if (match.length > 1) {
          return match.slice(1).filter(Boolean).join(' ').trim();
        }
      }
    }
  }
  
  // Fallback: general model extraction
  // Remove the brand name from the title
  let titleWithoutBrand = title;
  if (detectedBrand) {
    titleWithoutBrand = title.replace(new RegExp(detectedBrand, 'i'), '').trim();
  }
  
  // Split into words and filter out common words
  const words = titleWithoutBrand.split(/\s+/);
  const potentialModelWords = words.filter(word => {
    // Keep words that might be part of a model number
    const isCommon = COMMON_WORDS.has(word.toLowerCase());
    const isPotentialModel = /[A-Z0-9]/.test(word); // Contains at least one uppercase letter or number
    return !isCommon && isPotentialModel;
  });
  
  // Prioritize model numbers that follow patterns
  // 1. Words with numbers and letters (like X1 Carbon, 15z, etc.)
  const alphanumericModels = potentialModelWords.filter(word => /^[A-Za-z]?\d+[A-Za-z]?$/.test(word));
  if (alphanumericModels.length > 0) {
    return alphanumericModels[0];
  }
  
  // 2. Words with uppercase letters that might be series (like XPS, ENVY)
  const uppercaseModels = potentialModelWords.filter(word => /^[A-Z]{2,}$/.test(word));
  if (uppercaseModels.length > 0) {
    return uppercaseModels[0];
  }
  
  // 3. First potential model word if nothing else matches
  if (potentialModelWords.length > 0) {
    return potentialModelWords[0];
  }
  
  // If all else fails, return empty string
  return '';
}

/**
 * Clean and normalize the model string
 */
export function normalizeModel(model: string, title?: string, brand?: string): string {
  if (!model && title) {
    // If no model provided but we have a title, try to extract from title
    return extractModel(title, brand);
  }
  
  if (!model) return '';
  
  // Clean up the model - remove any unwanted prefixes
  const cleanModel = model
    .replace(/^v-?series/i, '')
    .replace(/^series/i, '')
    .trim();
  
  // If after cleaning we have nothing, try to extract from title
  if (!cleanModel && title) {
    return extractModel(title, brand);
  }
  
  return cleanModel;
}

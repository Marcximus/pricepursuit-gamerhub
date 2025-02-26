
// Model name extraction patterns for each brand
export const MODEL_PATTERNS: {[key: string]: RegExp} = {
  'Apple': /MacBook\s+(Air|Pro)(?:\s+(\d+\.?\d*)")?/i,
  'Lenovo': /(?:ThinkPad|IdeaPad|Yoga|Legion)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'HP': /(?:Pavilion|Envy|Spectre|Omen|EliteBook|ProBook)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Dell': /(?:XPS|Inspiron|Latitude|Precision|Vostro)\s+(\d+)(?:[A-Z0-9]+)?/i,
  'ASUS': /(?:ZenBook|VivoBook|ROG|TUF)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'Acer': /(?:Aspire|Predator|Nitro|Swift|Spin)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i,
  'MSI': /(?:Stealth|Raider|Titan|Prestige|Sword|Katana)\s+([A-Z0-9]+(?:-[A-Z0-9]+)?)/i
};

// Extract model name based on brand-specific patterns
export function extractModelName(title: string, brand: string, storedModel: string | undefined): string {
  if (storedModel) return storedModel;
  if (!title || !brand) return '';
  
  // Use brand-specific pattern if available
  const pattern = MODEL_PATTERNS[brand];
  if (pattern) {
    const match = title.match(pattern);
    if (match) {
      if (match[2]) {
        return `${match[1]} ${match[2]}`;
      }
      return match[1];
    }
  }
  
  // Generic model extraction (get text after brand name until the next punctuation or number)
  const brandIndex = title.toLowerCase().indexOf(brand.toLowerCase());
  if (brandIndex >= 0) {
    const afterBrand = title.substring(brandIndex + brand.length).trim();
    const modelMatch = afterBrand.match(/^[:\s]*([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+){0,2})/);
    if (modelMatch) {
      return modelMatch[1];
    }
  }
  
  return '';
}


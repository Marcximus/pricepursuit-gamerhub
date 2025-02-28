
// List of keywords that indicate a product is not a laptop
const FORBIDDEN_KEYWORDS = [
  'case', 'sleeve', 'bag', 'backpack', 'skin', 'protector', 'cover',
  'charger', 'adapter', 'cable', 'cord', 'power supply',
  'keyboard', 'mouse', 'touchpad', 'mousepad',
  'stand', 'dock', 'docking station', 'hub', 'port',
  'screen protector', 'privacy filter',
  'ram upgrade', 'memory upgrade', 'ssd upgrade',
  'replacement screen', 'replacement battery', 'replacement keyboard',
  'parts', 'repair', 'toolkit', 'cooling pad'
];

/**
 * Check if a title contains any forbidden keywords
 * @param title Product title to check
 * @returns True if the title contains any forbidden keywords
 */
export function containsForbiddenKeywords(title: string): boolean {
  if (!title) return false;
  
  const lowerTitle = title.toLowerCase();
  
  // Check if title contains any forbidden keywords
  return FORBIDDEN_KEYWORDS.some(keyword => 
    lowerTitle.includes(keyword.toLowerCase())
  );
}

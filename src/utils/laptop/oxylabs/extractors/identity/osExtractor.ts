
/**
 * Extract operating system
 */
export function extractOS(content: any): string | null {
  // Try product details first
  if (content.product_details?.operating_system && 
      typeof content.product_details.operating_system === 'string' &&
      content.product_details.operating_system.length > 0) {
    return content.product_details.operating_system.replace('‎', '').trim();
  }
  
  // Try to extract OS from title or description
  const textToSearch = content.title || '';
  const osPatterns = [
    /Windows\s+(?:10|11)\s+(?:Home|Pro)/i,
    /macOS|Mac\s+OS/i,
    /Chrome\s*OS/i,
    /Linux/i
  ];
  
  for (const pattern of osPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of osPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

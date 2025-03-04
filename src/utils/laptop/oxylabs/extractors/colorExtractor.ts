
/**
 * Extract color information
 */
export function extractColor(content: any): string | null {
  const colorPatterns = [
    /black(?!\s+keyboard)/i,
    /silver/i,
    /gray|grey/i,
    /white/i,
    /blue/i,
    /red/i,
    /pink/i,
    /gold/i,
    /space\s+gray/i,
    /rose\s+gold/i
  ];
  
  // Try to find color in title
  const title = content.title || '';
  for (const pattern of colorPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1);
    }
  }
  
  // Try product details, description, or bullet points
  const textToSearch = [
    content.description || '',
    content.bullet_points || ''
  ].join(' ');
  
  for (const pattern of colorPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1);
    }
  }
  
  return null;
}

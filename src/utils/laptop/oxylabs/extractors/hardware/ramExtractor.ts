
/**
 * Extract RAM information
 */
export function extractRam(content: any): string | null {
  // Try product details first
  if (content.product_details?.ram && 
      typeof content.product_details.ram === 'string' &&
      content.product_details.ram.length > 0) {
    return content.product_details.ram.replace('‎', '').trim();
  }
  
  // Try to extract RAM from title
  const title = content.title || '';
  const ramPattern = /(\d+)\s*GB\s*(?:DDR\d*)?(?:\s*RAM)?/i;
  const match = title.match(ramPattern);
  if (match) {
    return `${match[1]} GB`;
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(ramPattern);
    if (bulletMatch) {
      return `${bulletMatch[1]} GB`;
    }
  }
  
  return null;
}

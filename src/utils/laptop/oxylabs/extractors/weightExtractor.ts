
/**
 * Extract weight information
 */
export function extractWeight(content: any): string | null {
  // Try product details first
  if (content.product_details?.item_weight && 
      typeof content.product_details.item_weight === 'string' &&
      content.product_details.item_weight.length > 0) {
    return content.product_details.item_weight.replace('‎', '').trim();
  }
  
  // Try to extract weight from title
  const title = content.title || '';
  const weightPattern = /(\d+\.?\d*)\s*(?:pounds|lbs)/i;
  const match = title.match(weightPattern);
  if (match) {
    return `${match[1]} pounds`;
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(weightPattern);
    if (bulletMatch) {
      return `${bulletMatch[1]} pounds`;
    }
  }
  
  return null;
}

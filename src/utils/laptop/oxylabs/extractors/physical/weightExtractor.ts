
/**
 * Extract weight information with validation
 */
export function extractWeight(content: any): string | null {
  // Try product details first
  if (content.product_details?.item_weight && 
      typeof content.product_details.item_weight === 'string' &&
      content.product_details.item_weight.length > 0) {
    const weight = content.product_details.item_weight.replace('‎', '').trim();
    // Validate weight from product details
    const weightMatch = weight.match(/\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:pounds|lbs)\b/i);
    if (weightMatch) {
      const weightValue = parseFloat(weightMatch[1]);
      if (weightValue >= 0.5 && weightValue <= 8) {
        return `${weightValue} pounds`;
      }
    }
  }
  
  // Try to extract weight from title
  const title = content.title || '';
  const weightPattern = /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:pounds|lbs)\b/i;
  const match = title.match(weightPattern);
  if (match) {
    const weightValue = parseFloat(match[1]);
    if (weightValue >= 0.5 && weightValue <= 8) {
      return `${weightValue} pounds`;
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(weightPattern);
    if (bulletMatch) {
      const weightValue = parseFloat(bulletMatch[1]);
      if (weightValue >= 0.5 && weightValue <= 8) {
        return `${weightValue} pounds`;
      }
    }
  }
  
  return null;
}


/**
 * Extract graphics card information
 */
export function extractGraphics(content: any): string | null {
  // Try product details first
  if (content.product_details?.card_description && 
      typeof content.product_details.card_description === 'string' &&
      content.product_details.card_description.length > 0) {
    return content.product_details.card_description.replace('‎', '').trim();
  }
  
  // Try to extract graphics from title
  const title = content.title || '';
  const graphicsPatterns = [
    /NVIDIA\s+(?:GeForce\s+)?(?:RTX|GTX)\s+\d{3,4}(?:\s*Ti)?(?:\s*Super)?/i,
    /AMD\s+Radeon\s+(?:RX\s+)?\d{3,4}(?:\s*XT)?/i,
    /Intel\s+(?:UHD|Iris\s+Xe)\s+Graphics/i,
    /Apple\s+M[123]\s+(?:GPU|Graphics)/i
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of graphicsPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

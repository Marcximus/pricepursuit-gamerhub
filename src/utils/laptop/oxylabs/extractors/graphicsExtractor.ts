
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
    /Intel\s+(?:UHD|HD|Iris\s+Xe)\s+Graphics(?:\s+\d+)?/i,
    /Apple\s+M[123]\s+(?:GPU|Graphics)/i
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Check for Intel HD Graphics in description
  if (content.description && typeof content.description === 'string') {
    const intelMatch = content.description.match(/Intel\s+(?:UHD|HD|Iris\s+Xe)\s+Graphics(?:\s+\d+)?/i);
    if (intelMatch) {
      return intelMatch[0];
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
    
    // Specifically look for Intel HD graphics in bullet points
    const intelMatch = content.bullet_points.match(/Intel\s+(?:UHD|HD|Iris\s+Xe)\s+Graphics(?:\s+\d+)?/i);
    if (intelMatch) {
      return intelMatch[0];
    }
  }
  
  return null;
}


/**
 * Extract screen size
 */
export function extractScreenSize(content: any): string | null {
  // Try product details first
  if (content.product_details?.standing_screen_display_size && 
      typeof content.product_details.standing_screen_display_size === 'string' &&
      content.product_details.standing_screen_display_size.length > 0) {
    return content.product_details.standing_screen_display_size.replace('‎', '').trim();
  }
  
  // Try to extract screen size from title
  const title = content.title || '';
  const screenPattern = /(\d+\.?\d*)["-]?(?:\s*inch(?:es)?)?(?:\s*display)?/i;
  const match = title.match(screenPattern);
  if (match && parseFloat(match[1]) > 8 && parseFloat(match[1]) < 30) { // Valid laptop screen sizes
    return `${match[1]}"`;
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(screenPattern);
    if (bulletMatch && parseFloat(bulletMatch[1]) > 8 && parseFloat(bulletMatch[1]) < 30) {
      return `${bulletMatch[1]}"`;
    }
  }
  
  return null;
}

/**
 * Extract screen resolution
 */
export function extractScreenResolution(content: any): string | null {
  // Try to extract resolution from title
  const title = content.title || '';
  const resolutionPatterns = [
    /(\d+)\s*x\s*(\d+)/i,
    /4K|UHD|QHD|FHD|HD\+|Full\s*HD|Retina/i
  ];
  
  for (const pattern of resolutionPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of resolutionPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

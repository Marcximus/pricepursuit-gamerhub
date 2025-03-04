/**
 * Extract screen size
 */
export function extractScreenSize(content: any): string | null {
  let extractedSize: number | null = null;
  
  // Try product details first
  if (content.product_details?.standing_screen_display_size && 
      typeof content.product_details.standing_screen_display_size === 'string' &&
      content.product_details.standing_screen_display_size.length > 0) {
    const match = content.product_details.standing_screen_display_size.replace('‎', '').trim().match(/(\d+\.?\d*)/);
    if (match && match[1]) {
      extractedSize = parseFloat(match[1]);
    }
  }
  
  // Try to extract screen size from title if we don't have it yet
  if (!extractedSize) {
    const title = content.title || '';
    const screenPattern = /(\d+\.?\d*)["-]?(?:\s*inch(?:es)?)?(?:\s*display)?/i;
    const match = title.match(screenPattern);
    if (match && parseFloat(match[1]) > 8 && parseFloat(match[1]) < 30) { // Valid laptop screen sizes
      extractedSize = parseFloat(match[1]);
    }
  }
  
  // Try bullet points as last resort
  if (!extractedSize && content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(/(\d+\.?\d*)["-]?(?:\s*inch(?:es)?)?(?:\s*display)?/i);
    if (bulletMatch && parseFloat(bulletMatch[1]) > 8 && parseFloat(bulletMatch[1]) < 30) {
      extractedSize = parseFloat(bulletMatch[1]);
    }
  }
  
  // Group into size categories
  if (extractedSize) {
    if (extractedSize >= 18) return '18.0" +';
    if (extractedSize >= 17) return '17.0" +';
    if (extractedSize >= 16) return '16.0" +';
    if (extractedSize >= 15) return '15.0" +';
    if (extractedSize >= 14) return '14.0" +';
    if (extractedSize >= 13) return '13.0" +';
    if (extractedSize >= 12) return '12.0" +';
    if (extractedSize >= 11) return '11.0" +';
    if (extractedSize >= 10) return '10.0" +';
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

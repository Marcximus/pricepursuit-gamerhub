
/**
 * Extract image URL from API response with enhanced fallbacks
 */
export function extractImageUrl(content: any): string | null {
  // Primary check: images array
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    // Choose the first image URL
    return content.images[0];
  }
  
  // Fallback checks for other possible image sources
  if (content.image_large) {
    return content.image_large;
  }
  
  if (content.image_primary) {
    return content.image_primary;
  }
  
  if (content.thumbnail) {
    // If we only have a thumbnail, try to get a larger version by URL pattern
    const thumbnail = content.thumbnail;
    if (thumbnail.includes('._SL75_') || thumbnail.includes('._SX50_')) {
      // Convert thumbnail URL to full-size image URL by replacing size indicators
      return thumbnail.replace(/\._S[LX]\d+_/, '._SL500_');
    }
    return thumbnail;
  }
  
  // Last resort: check if there's an image URL in the raw response
  if (content.main_image) {
    return content.main_image;
  }
  
  return null;
}

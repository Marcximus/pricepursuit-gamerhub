
/**
 * Extract image URL with safety checks
 */
export function extractImageUrl(content: any): string | null {
  // Check for direct image properties first
  if (content.image_url && typeof content.image_url === 'string' && content.image_url.startsWith('http')) {
    return content.image_url;
  }
  
  if (content.image && typeof content.image === 'string' && content.image.startsWith('http')) {
    return content.image;
  }
  
  // Check images array with validation
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    // Find the first valid image URL
    for (const img of content.images) {
      if (typeof img === 'string' && img.startsWith('http')) {
        return img;
      }
    }
  }
  
  // Alternative fields that might contain image data
  if (content.image_large && typeof content.image_large === 'string' && content.image_large.startsWith('http')) {
    return content.image_large;
  }
  
  if (content.thumbnail && typeof content.thumbnail === 'string' && content.thumbnail.startsWith('http')) {
    // If thumbnail URL has size indicators, try to get a larger version
    if (content.thumbnail.includes('._S')) {
      return content.thumbnail.replace(/\._S[LX]\d+_/, '._SL500_');
    }
    return content.thumbnail;
  }
  
  // Fallback to potential nested image objects
  if (content.mainImage && content.mainImage.url && typeof content.mainImage.url === 'string') {
    return content.mainImage.url;
  }
  
  return null;
}

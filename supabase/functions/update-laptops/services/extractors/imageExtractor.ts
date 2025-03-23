
/**
 * Extract image URL from API response with enhanced fallbacks
 */
export function extractImageUrl(content: any): string | null {
  // Primary source: images array
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    // Choose the first valid image URL
    for (const img of content.images) {
      if (typeof img === 'string' && img.startsWith('http')) {
        return img;
      }
    }
  }
  
  // Secondary sources in order of preference
  const imageProperties = [
    'image_url', 'image', 'image_large', 'image_primary', 
    'thumbnail', 'main_image', 'featured_image', 'product_image'
  ];
  
  for (const prop of imageProperties) {
    if (content[prop] && typeof content[prop] === 'string' && content[prop].startsWith('http')) {
      // If we have a thumbnail, try to get a larger version by URL pattern
      if (prop === 'thumbnail' && 
          (content[prop].includes('._SL75_') || 
           content[prop].includes('._SX50_') ||
           content[prop].includes('_AC_US40_'))) {
        // Convert thumbnail URL to full-size image URL by replacing size indicators
        return content[prop]
          .replace(/\._S[LX]\d+_/, '._SL500_')
          .replace(/_AC_US\d+_/, '_AC_SL1000_');
      }
      
      return content[prop];
    }
  }
  
  // Check for potential nested image objects
  if (content.main_image && typeof content.main_image === 'object') {
    if (content.main_image.url && typeof content.main_image.url === 'string') {
      return content.main_image.url;
    }
  }
  
  // Check for image data in a variants array
  if (content.variants && Array.isArray(content.variants) && content.variants.length > 0) {
    for (const variant of content.variants) {
      if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
        return variant.images[0];
      }
      if (variant.image && typeof variant.image === 'string') {
        return variant.image;
      }
    }
  }
  
  return null;
}


/**
 * Extract image URL with safety checks and enhanced fallbacks
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
      } else if (typeof img === 'object' && img?.url && typeof img.url === 'string' && img.url.startsWith('http')) {
        return img.url;
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
  
  // Check for enhanced Amazon image sources
  if (content.main_image && typeof content.main_image === 'string' && content.main_image.startsWith('http')) {
    return content.main_image;
  }
  
  // Some Oxylabs responses nest images in different objects
  if (content.mainImage && content.mainImage.url && typeof content.mainImage.url === 'string') {
    return content.mainImage.url;
  }
  
  // Check for variants
  if (content.variants && Array.isArray(content.variants) && content.variants.length > 0) {
    for (const variant of content.variants) {
      if (variant.image && typeof variant.image === 'string' && variant.image.startsWith('http')) {
        return variant.image;
      }
      if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
        const img = variant.images[0];
        if (typeof img === 'string' && img.startsWith('http')) {
          return img;
        }
      }
    }
  }
  
  // Try handling special Amazon image formats
  if (content.images_data && Array.isArray(content.images_data) && content.images_data.length > 0) {
    const imgData = content.images_data[0];
    if (imgData && imgData.link && typeof imgData.link === 'string') {
      return imgData.link;
    }
  }
  
  // Last attempt: look for any property that might contain an image URL
  for (const key in content) {
    if (
      (key.includes('image') || key.includes('photo') || key.includes('picture')) &&
      typeof content[key] === 'string' &&
      content[key].startsWith('http')
    ) {
      return content[key];
    }
  }
  
  return null;
}

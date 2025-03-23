
/**
 * Extract image URL from API response with enhanced fallbacks
 */
export function extractImageUrl(content: any): string | null {
  // First check direct high-quality image sources
  const directImageProps = [
    'main_image', 'hero_image', 'featured_image', 'primary_image',
    'image_large', 'image_url', 'image'
  ];
  
  for (const prop of directImageProps) {
    if (content[prop] && typeof content[prop] === 'string' && content[prop].startsWith('http')) {
      // Get high-quality version if available
      if (content[prop].includes('amazon.com') || content[prop].includes('ssl-images-amazon')) {
        // Remove size parameters for Amazon images
        return content[prop].replace(/\._.*_\./, '.');
      }
      return content[prop];
    }
  }
  
  // Handle image arrays
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    for (const img of content.images) {
      if (typeof img === 'string' && img.startsWith('http')) {
        // Process Amazon images
        if (img.includes('amazon.com') || img.includes('ssl-images-amazon')) {
          return img.replace(/\._.*_\./, '.');
        }
        return img;
      }
      // Handle complex image objects
      if (typeof img === 'object' && img !== null) {
        if (img.url && typeof img.url === 'string' && img.url.startsWith('http')) {
          return img.url;
        }
        if (img.src && typeof img.src === 'string' && img.src.startsWith('http')) {
          return img.src;
        }
        if (img.large && typeof img.large === 'string' && img.large.startsWith('http')) {
          return img.large;
        }
      }
    }
  }
  
  // Handle thumbnails - try to get larger version
  if (content.thumbnail && typeof content.thumbnail === 'string' && content.thumbnail.startsWith('http')) {
    if (content.thumbnail.includes('._SL')) {
      return content.thumbnail.replace(/\._S[LX]\d+_/, '._SL1000_');
    }
    if (content.thumbnail.includes('_AC_US')) {
      return content.thumbnail.replace(/_AC_US\d+_/, '_AC_SL1500_');
    }
    if (content.thumbnail.includes('_UL')) {
      return content.thumbnail.replace(/_UL\d+_/, '_UL1500_');
    }
    return content.thumbnail;
  }
  
  // Check for nested image objects
  const nestedImageProps = ['mainImage', 'main_image_data', 'primaryImage', 'heroImage'];
  for (const prop of nestedImageProps) {
    if (content[prop] && typeof content[prop] === 'object') {
      const imgObj = content[prop];
      if (imgObj.url && typeof imgObj.url === 'string') {
        return imgObj.url;
      }
      if (imgObj.src && typeof imgObj.src === 'string') {
        return imgObj.src;
      }
      if (imgObj.large && typeof imgObj.large === 'string') {
        return imgObj.large;
      }
    }
  }
  
  // Check for variants
  if (content.variants && Array.isArray(content.variants) && content.variants.length > 0) {
    for (const variant of content.variants) {
      if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
        const img = variant.images[0];
        if (typeof img === 'string' && img.startsWith('http')) {
          return img;
        }
      }
      if (variant.image && typeof variant.image === 'string') {
        return variant.image;
      }
    }
  }
  
  // Check for image_data array
  if (content.images_data && Array.isArray(content.images_data) && content.images_data.length > 0) {
    for (const imgData of content.images_data) {
      if (imgData.link && typeof imgData.link === 'string') {
        return imgData.link;
      }
      if (imgData.url && typeof imgData.url === 'string') {
        return imgData.url;
      }
      if (imgData.large && typeof imgData.large === 'string') {
        return imgData.large;
      }
    }
  }
  
  // Last-ditch effort: scan all properties for anything that looks like an image URL
  for (const key in content) {
    const propName = key.toLowerCase();
    if ((propName.includes('image') || propName.includes('photo') || propName.includes('picture')) && 
        typeof content[key] === 'string' && 
        content[key].startsWith('http')) {
      return content[key];
    }
  }
  
  return null;
}


/**
 * Extract image URL from API response
 */
export function extractImageUrl(content: any): string | null {
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    // Choose the first image URL
    return content.images[0];
  }
  
  return null;
}


/**
 * Extract image URL with safety checks
 */
export function extractImageUrl(content: any): string | null {
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    return content.images[0];
  }
  
  return null;
}

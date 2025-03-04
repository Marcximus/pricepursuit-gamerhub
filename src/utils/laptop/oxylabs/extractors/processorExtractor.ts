
/**
 * Extract processor information from multiple sources
 */
export function extractProcessor(content: any): string | null {
  // Try product details first
  if (content.product_details?.processor && 
      typeof content.product_details.processor === 'string' &&
      content.product_details.processor.length > 0) {
    return content.product_details.processor.replace('‎', '').trim();
  }
  
  // Try to extract from title
  const title = content.title || '';
  const processorPatterns = [
    /intel\s+core\s+i[3579][0-9-]*(?:\s+\d+(?:\.\d+)?(?:GHz)?)?/i,
    /amd\s+ryzen\s+[3579][0-9]*(?:\s+\d+(?:\.\d+)?(?:GHz)?)?/i,
    /apple\s+m[123]\s+(?:pro|max|ultra)?/i
  ];
  
  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of processorPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

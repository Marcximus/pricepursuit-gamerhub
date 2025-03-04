
/**
 * Extract storage information
 */
export function extractStorage(content: any): string | null {
  // Try product details first
  if (content.product_details?.hard_drive && 
      typeof content.product_details.hard_drive === 'string' &&
      content.product_details.hard_drive.length > 0) {
    return content.product_details.hard_drive.replace('‎', '').trim();
  }
  
  // Try to extract storage from title
  const title = content.title || '';
  const storagePatterns = [
    /(\d+)\s*TB\s*(?:SSD|HDD|NVMe|PCIe)/i,
    /(\d+)\s*GB\s*(?:SSD|HDD|NVMe|PCIe)/i
  ];
  
  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) {
      if (pattern.source.includes('TB')) {
        return `${match[1]} TB`;
      } else {
        return `${match[1]} GB`;
      }
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of storagePatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        if (pattern.source.includes('TB')) {
          return `${match[1]} TB`;
        } else {
          return `${match[1]} GB`;
        }
      }
    }
  }
  
  return null;
}

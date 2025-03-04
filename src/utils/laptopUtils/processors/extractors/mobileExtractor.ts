
import { mobileProcessorPatterns } from '../patterns/processorPatterns';

/**
 * Extracts and processes mobile processors (Snapdragon, MediaTek)
 */
export function extractMobileProcessor(text: string): string | null {
  if (!text) return null;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Snapdragon
  if (mobileProcessorPatterns.snapdragon.test(normalizedText)) {
    const match = normalizedText.match(/\b(?:qualcomm\s+)?snapdragon\s+([a-z0-9]+)?\b/i);
    if (match && match[1]) {
      return `Qualcomm Snapdragon ${match[1]}`;
    }
    return 'Qualcomm Snapdragon';
  }
  
  // Check for MediaTek
  if (mobileProcessorPatterns.mediatek.test(normalizedText)) {
    // Check for MediaTek Dimensity
    if (normalizedText.includes('dimensity')) {
      const match = normalizedText.match(/\bmediatek\s+dimensity\s+([a-z0-9]+)\b/i);
      if (match && match[1]) {
        return `MediaTek Dimensity ${match[1]}`;
      }
      return 'MediaTek Dimensity';
    }
    
    // Check for MediaTek Helio
    if (normalizedText.includes('helio')) {
      const match = normalizedText.match(/\bmediatek\s+helio\s+([a-z0-9]+)\b/i);
      if (match && match[1]) {
        return `MediaTek Helio ${match[1]}`;
      }
      return 'MediaTek Helio';
    }
    
    // Generic MediaTek
    const match = normalizedText.match(/\bmediatek\s+([a-z0-9]+)?\b/i);
    if (match && match[1]) {
      return `MediaTek ${match[1]}`;
    }
    return 'MediaTek';
  }
  
  return null;
}

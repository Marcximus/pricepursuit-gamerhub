
import { mobileProcessorPatterns } from '../processorPatterns';

/**
 * Extracts mobile processors (MediaTek, Snapdragon) from a laptop title
 */
export const extractMobileProcessor = (normalizedTitle: string): string | null => {
  // Try to extract MediaTek
  const mediatekMatch = normalizedTitle.match(mobileProcessorPatterns.mediatek);
  if (mediatekMatch) {
    return `MediaTek ${mediatekMatch[1]}`;
  }
  
  // Try to extract Snapdragon
  const snapdragonMatch = normalizedTitle.match(mobileProcessorPatterns.snapdragon);
  if (snapdragonMatch) {
    return `Qualcomm Snapdragon ${snapdragonMatch[1]}`;
  }
  
  return null;
};

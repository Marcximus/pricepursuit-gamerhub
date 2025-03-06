
/**
 * Utility functions for formatting text with emojis and paragraphs
 */

import { addEmojisToText } from './emojiUtils';
import { splitIntoParagraphs } from './paragraphUtils';
import { enhanceReasonText } from './textEnhancer';

/**
 * Formats the text for the recommendation reasons
 * @param reason The recommendation reason text
 * @returns Formatted paragraphs with emojis
 */
export const formatRecommendationReason = (reason: string): string[] => {
  if (!reason) return ["No details available 🤔"];
  
  // Enhance the reason text to focus on the laptop's strengths
  const enhancedReason = enhanceReasonText(reason);
  
  // For longer text, split into paragraphs
  const paragraphs = splitIntoParagraphs(enhancedReason);
  
  // Add emojis to each paragraph, but with balanced usage
  return paragraphs.map(paragraph => addEmojisToText(paragraph, true));
};

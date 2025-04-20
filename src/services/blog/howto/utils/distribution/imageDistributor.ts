
import { generateImagePlaceholder } from '../generators/placeholder';
import { findIntroductionEnd, findH2Headings } from '../content/sectionFinder';

/**
 * Distribute images evenly across the content but after introduction
 */
export function distributeImagesBeforeSections(content: string, imageCount: number = 5): string {  // Changed default from 3 to 5
  if (!content || imageCount <= 0) return content;
  
  // Find where the introduction ends
  const contentStartIndex = findIntroductionEnd(content);
  if (contentStartIndex === 0) return content;
  
  // Split content into intro and main content
  const introContent = content.substring(0, contentStartIndex);
  const mainContent = content.substring(contentStartIndex);
  
  // Find all h2 tags in the main content
  const h2Matches = findH2Headings(mainContent);
  if (h2Matches.length === 0) return content;
  
  // Calculate target positions for even distribution (20%, 40%, 60%, 80%)
  const contentLength = mainContent.length;
  const targetPositions = Array.from({ length: imageCount }, (_, i) => 
    Math.floor((i + 1) * contentLength / (imageCount + 1))
  );
  
  // Find the nearest h2 tags to our target positions
  let result = introContent;
  let remainingContent = mainContent;
  
  for (let i = 0; i < Math.min(imageCount, h2Matches.length); i++) {
    // Find the nearest h2 tag to our target position
    let nearestH2Index = 0;
    let minDistance = Infinity;
    
    const availableH2s = findH2Headings(remainingContent);
    for (let j = 0; j < availableH2s.length; j++) {
      const distance = Math.abs(availableH2s[j].index - targetPositions[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestH2Index = j;
      }
    }
    
    // Insert image before this h2 tag
    const h2Position = availableH2s[nearestH2Index].index;
    const imageHTML = generateImagePlaceholder(i + 1);
    
    result += remainingContent.substring(0, h2Position) + imageHTML;
    remainingContent = remainingContent.substring(h2Position);
    
    // Adjust remaining target positions
    targetPositions.forEach((pos, index) => {
      if (index > i) {
        targetPositions[index] -= h2Position;
      }
    });
  }
  
  // Add remaining content
  result += remainingContent;
  
  return result;
}

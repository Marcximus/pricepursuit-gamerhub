
/**
 * Handle image placeholder replacements in How-To content
 */
export function replaceImagePlaceholders(content: string): string {
  if (!content) return content;
  
  return content.replace(/Image (\d+)/g, (match, number) => {
    return `<div class="image-placeholder" id="image-${number}">
      <p class="placeholder-text">Click to upload image ${number}</p>
    </div>`;
  });
}

/**
 * Distribute images evenly across the content but after introduction
 * @param content HTML content
 * @param imageCount Number of images to distribute
 * @returns HTML content with image placeholders inserted
 */
export function distributeImagesBeforeSections(content: string, imageCount: number = 3): string {
  if (!content || imageCount <= 0) return content;
  
  // Find the first h1 or h2 tag (intro heading)
  const introHeadingRegex = /<h[12][^>]*>/;
  const introMatch = content.match(introHeadingRegex);
  
  if (!introMatch) return content;
  
  // Get content after the introduction section
  const introEnd = introMatch.index! + introMatch[0].length;
  const firstParagraphRegex = /<\/p>/;
  const firstParagraphMatch = content.substring(introEnd).match(firstParagraphRegex);
  
  let contentStartIndex = introEnd;
  if (firstParagraphMatch) {
    contentStartIndex = introEnd + firstParagraphMatch.index! + 4; // 4 is the length of </p>
  }
  
  // Split content into intro and main content
  const introContent = content.substring(0, contentStartIndex);
  const mainContent = content.substring(contentStartIndex);
  
  // Find all h2 tags in the main content
  const h2Regex = /<h2[^>]*>/g;
  const h2Matches = Array.from(mainContent.matchAll(h2Regex));
  
  if (h2Matches.length === 0) return content;
  
  // Calculate target positions for even distribution (25%, 50%, 75%)
  const contentLength = mainContent.length;
  const targetPositions = Array.from({ length: imageCount }, (_, i) => 
    Math.floor((i + 1) * contentLength / (imageCount + 1))
  );
  
  // Find the nearest h2 tags to our target positions
  let offset = 0;
  let result = introContent;
  let remainingContent = mainContent;
  
  for (let i = 0; i < Math.min(imageCount, h2Matches.length); i++) {
    // Find the nearest h2 tag to our target position
    let nearestH2Index = 0;
    let minDistance = Infinity;
    
    for (let j = 0; j < h2Matches.length; j++) {
      const distance = Math.abs(h2Matches[j].index! - targetPositions[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestH2Index = j;
      }
    }
    
    // Insert image before this h2 tag
    const h2Position = h2Matches[nearestH2Index].index!;
    const imageHTML = generateImagePlaceholder(i + 1);
    
    result += remainingContent.substring(0, h2Position) + imageHTML;
    remainingContent = remainingContent.substring(h2Position);
    
    // Remove used h2 tag from future consideration
    h2Matches.splice(nearestH2Index, 1);
    
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

function generateImagePlaceholder(imageNumber: number): string {
  return `<div class="section-image">
    <div class="image-placeholder" id="image-${imageNumber}">
      <p class="placeholder-text">Click to upload image ${imageNumber}</p>
    </div>
  </div>\n`;
}

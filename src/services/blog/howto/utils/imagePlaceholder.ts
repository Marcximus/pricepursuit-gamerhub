
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
 * Distribute images evenly across the content before section breaks
 * @param content HTML content
 * @param imageCount Number of images to distribute
 * @returns HTML content with image placeholders inserted before section breaks
 */
export function distributeImagesBeforeSections(content: string, imageCount: number = 3): string {
  if (!content || imageCount <= 0) return content;
  
  // Find all section break points (h2, h3, div.qa-item, div.step-container)
  const sectionBreakRegex = /<(h2|h3|div class="qa-item"|div class="step-container")[^>]*>/g;
  const matches = Array.from(content.matchAll(sectionBreakRegex));
  
  if (matches.length <= 1) {
    // Not enough section breaks, return content as is
    return content;
  }
  
  // Skip the first heading (usually the title) and distribute images before other section breaks
  const availableBreakPoints = matches.slice(1);
  const breakPointsToUse = Math.min(imageCount, availableBreakPoints.length);
  
  // Calculate which break points to use for even distribution
  const breakIndices = [];
  for (let i = 0; i < breakPointsToUse; i++) {
    const index = Math.floor(availableBreakPoints.length * (i + 1) / (breakPointsToUse + 1));
    breakIndices.push(index);
  }
  
  // Insert image placeholders at the calculated positions
  let result = content;
  let offset = 0;
  
  breakIndices.forEach((breakIdx, imageIdx) => {
    if (breakIdx < availableBreakPoints.length) {
      const match = availableBreakPoints[breakIdx];
      const position = match.index! + offset;
      const imageHTML = `<div class="section-image">
        <div class="image-placeholder" id="image-${imageIdx + 1}">
          <p class="placeholder-text">Click to upload image ${imageIdx + 1}</p>
        </div>
      </div>\n`;
      
      result = result.slice(0, position) + imageHTML + result.slice(position);
      offset += imageHTML.length;
    }
  });
  
  return result;
}

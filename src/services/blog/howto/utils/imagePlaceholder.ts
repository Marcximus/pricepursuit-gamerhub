
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
  
  // Focus on finding h2 tags and other major section breaks
  const sectionBreakRegex = /<h2[^>]*>/g;
  const matches = Array.from(content.matchAll(sectionBreakRegex));
  
  // If no h2 headings found, try with other section breaks
  if (matches.length === 0) {
    const fallbackBreakRegex = /<(h3|div class="qa-item"|div class="step-container")[^>]*>/g;
    const fallbackMatches = Array.from(content.matchAll(fallbackBreakRegex));
    
    if (fallbackMatches.length <= 1) {
      // Not enough section breaks, insert at regular intervals in the content
      return insertImagesAtRegularIntervals(content, imageCount);
    }
    
    // Use fallback matches for positioning
    return insertImagesBeforeMatches(content, fallbackMatches, imageCount);
  }
  
  // Use h2 matches for positioning
  return insertImagesBeforeMatches(content, matches, imageCount);
}

/**
 * Insert images before matched section breaks
 */
function insertImagesBeforeMatches(content: string, matches: RegExpMatchArray[], imageCount: number): string {
  // Skip the first heading (usually the title) and distribute images before other section breaks
  const availableBreakPoints = matches.length > 1 ? matches.slice(1) : matches;
  
  if (availableBreakPoints.length === 0) {
    return insertImagesAtRegularIntervals(content, imageCount);
  }
  
  const breakPointsToUse = Math.min(imageCount, availableBreakPoints.length);
  
  // Calculate which break points to use for even distribution
  const breakIndices = [];
  for (let i = 0; i < breakPointsToUse; i++) {
    // Distribute evenly across available break points
    const index = Math.floor((i * availableBreakPoints.length) / breakPointsToUse);
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

/**
 * Insert images at regular intervals when no suitable section breaks are found
 */
function insertImagesAtRegularIntervals(content: string, imageCount: number): string {
  if (imageCount <= 0) return content;
  
  const contentLength = content.length;
  let result = content;
  let offset = 0;
  
  // Skip first 20% of content for first image to avoid placing near the title
  const startOffset = Math.floor(contentLength * 0.2);
  
  for (let i = 0; i < imageCount; i++) {
    // Calculate position based on content length
    // First image after 20% of content, then distribute remaining images evenly
    const position = i === 0 
      ? startOffset 
      : Math.floor(startOffset + ((contentLength - startOffset) * i / imageCount));
    
    // Find the next paragraph or section end to insert image
    const nextParagraphEnd = result.indexOf('</p>', position + offset);
    const insertPosition = nextParagraphEnd !== -1 ? nextParagraphEnd + 4 : position + offset;
    
    const imageHTML = `<div class="section-image">
      <div class="image-placeholder" id="image-${i + 1}">
        <p class="placeholder-text">Click to upload image ${i + 1}</p>
      </div>
    </div>\n`;
    
    result = result.slice(0, insertPosition) + imageHTML + result.slice(insertPosition);
    offset += imageHTML.length;
  }
  
  return result;
}

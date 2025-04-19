
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
 * Skip the first section since it will have an intro image
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
      // Skip the first 30% of content to account for intro
      return insertImagesAtRegularIntervals(content, imageCount);
    }
    
    // Skip the first match (intro section) and distribute remaining images
    // Make sure we have at least one match before slicing
    const matchesToUse = fallbackMatches.length > 1 ? fallbackMatches.slice(1) : [];
    return insertImagesBeforeMatches(content, matchesToUse, imageCount);
  }
  
  // Skip the first h2 match (intro section) and distribute images among remaining sections
  // Make sure we have at least one match before slicing
  const matchesToUse = matches.length > 1 ? matches.slice(1) : [];
  return insertImagesBeforeMatches(content, matchesToUse, imageCount);
}

/**
 * Insert images before matched section breaks
 */
function insertImagesBeforeMatches(content: string, matches: RegExpMatchArray[], imageCount: number): string {
  if (matches.length === 0) {
    return insertImagesAtRegularIntervals(content, imageCount);
  }
  
  // Make sure we have enough matches to distribute images
  // We need at least one match per image
  if (matches.length < imageCount) {
    return insertImagesAtRegularIntervals(content, imageCount);
  }
  
  const breakPointsToUse = Math.min(imageCount, matches.length);
  
  // Calculate which break points to use for even distribution
  const breakIndices = [];
  for (let i = 0; i < breakPointsToUse; i++) {
    // Distribute evenly across available break points
    const index = Math.floor((i * matches.length) / breakPointsToUse);
    breakIndices.push(index);
  }
  
  // Insert image placeholders at the calculated positions
  let result = content;
  let offset = 0;
  
  breakIndices.forEach((breakIdx, imageIdx) => {
    if (breakIdx < matches.length) {
      const match = matches[breakIdx];
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
 * Skip the first 30% of content to account for intro
 */
function insertImagesAtRegularIntervals(content: string, imageCount: number): string {
  if (imageCount <= 0) return content;
  
  const contentLength = content.length;
  let result = content;
  let offset = 0;
  
  // Skip first 30% of content to account for intro section
  const startOffset = Math.floor(contentLength * 0.3);
  
  // Only distribute remaining images in the last 70% of content
  const remainingLength = contentLength - startOffset;
  
  for (let i = 0; i < imageCount; i++) {
    // Calculate position in remaining content
    const position = startOffset + Math.floor((remainingLength * (i + 1)) / (imageCount + 1));
    
    // Find the next paragraph or section end to insert image
    const nextParagraphEnd = result.indexOf('</p>', position + offset);
    const insertPosition = nextParagraphEnd !== -1 ? nextParagraphEnd + 4 : position + offset;
    
    const imageHTML = `<div class="section-image">
      <div class="image-placeholder" id="image-${i + 1}">
        <p class="placeholder-text">Click to upload image ${i + 1}</p>
      </div>
    </div>\n`;
    
    result = 
      result.slice(0, insertPosition) + 
      imageHTML + 
      result.slice(insertPosition);
      
    offset += imageHTML.length;
  }
  
  return result;
}

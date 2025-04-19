
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
    const fallbackBreakRegex = /<(h[1-6]|div class="qa-item"|div class="step-container")[^>]*>/g;
    const fallbackMatches = Array.from(content.matchAll(fallbackBreakRegex));
    
    if (fallbackMatches.length <= 1) {
      // Not enough section breaks, insert at regular intervals in the content
      // Skip the first 35% of content to account for intro
      return insertImagesAtRegularIntervals(content, imageCount);
    }
    
    // Skip the first match (intro section) and distribute remaining images
    if (fallbackMatches.length > 1) {
      // Make sure we have at least one match after skipping the intro
      const matchesToUse = fallbackMatches.slice(1);
      return insertImagesBeforeMatches(content, matchesToUse, imageCount);
    }
  }
  
  // Skip the first h2 match (intro section) and distribute images among remaining sections
  if (matches.length > 1) {
    // Make sure we have at least one match after skipping the intro
    const matchesToUse = matches.slice(1);
    return insertImagesBeforeMatches(content, matchesToUse, imageCount);
  } else if (matches.length === 1) {
    // If there's only one h2, use it as a boundary and place images after it
    return insertImagesAfterIntroHeading(content, matches[0], imageCount);
  }
  
  return insertImagesAtRegularIntervals(content, imageCount);
}

/**
 * Insert images before matched section breaks
 */
function insertImagesBeforeMatches(content: string, matches: RegExpMatchArray[], imageCount: number): string {
  if (matches.length === 0) {
    return insertImagesAtRegularIntervals(content, imageCount);
  }
  
  // Calculate how many section breaks we'll use to distribute images
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
 * Skip the first 35% of content to account for intro
 */
function insertImagesAtRegularIntervals(content: string, imageCount: number): string {
  if (imageCount <= 0) return content;
  
  const contentLength = content.length;
  let result = content;
  let offset = 0;
  
  // Skip first 35% of content to account for intro section
  const startOffset = Math.floor(contentLength * 0.35);
  
  // Only distribute images in the last 65% of content
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

/**
 * Insert images after an intro heading, evenly throughout the rest of the content
 */
function insertImagesAfterIntroHeading(content: string, introHeading: RegExpMatchArray, imageCount: number): string {
  if (imageCount <= 0) return content;
  
  const headingPosition = introHeading.index!;
  const headingLength = introHeading[0].length;
  const afterHeadingStart = headingPosition + headingLength;
  
  // Get the content after the intro heading
  const contentBeforeHeading = content.slice(0, afterHeadingStart);
  const contentAfterHeading = content.slice(afterHeadingStart);
  
  // Find locations to insert the images in the content after the heading
  let processedContent = contentAfterHeading;
  let offset = 0;
  
  // Find paragraph breaks to insert after
  const paragraphBreaks = Array.from(processedContent.matchAll(/<\/p>/g));
  
  if (paragraphBreaks.length >= imageCount) {
    // Calculate which paragraph breaks to use
    for (let i = 0; i < imageCount; i++) {
      // Distribute evenly, but ensure we're not too close to the start
      // Skip the very first paragraph which might still be part of intro
      const targetIndex = Math.floor(((i + 1) * paragraphBreaks.length) / (imageCount + 1));
      const adjustedIndex = Math.max(1, Math.min(targetIndex, paragraphBreaks.length - 1));
      
      const insertPosition = paragraphBreaks[adjustedIndex].index! + 4 + offset;
      
      const imageHTML = `<div class="section-image">
        <div class="image-placeholder" id="image-${i + 1}">
          <p class="placeholder-text">Click to upload image ${i + 1}</p>
        </div>
      </div>\n`;
      
      processedContent = 
        processedContent.slice(0, insertPosition) + 
        imageHTML + 
        processedContent.slice(insertPosition);
      
      offset += imageHTML.length;
    }
    
    return contentBeforeHeading + processedContent;
  } else {
    // Not enough paragraph breaks, distribute evenly
    const contentLength = contentAfterHeading.length;
    
    for (let i = 0; i < imageCount; i++) {
      // Skip the first 10% of the after-heading content, which might still be intro
      const startPos = Math.floor(contentLength * 0.1);
      const insertPosition = startPos + Math.floor(((i + 1) * (contentLength - startPos)) / (imageCount + 1)) + offset;
      
      const imageHTML = `<div class="section-image">
        <div class="image-placeholder" id="image-${i + 1}">
          <p class="placeholder-text">Click to upload image ${i + 1}</p>
        </div>
      </div>\n`;
      
      processedContent = 
        processedContent.slice(0, insertPosition) + 
        imageHTML + 
        processedContent.slice(insertPosition);
      
      offset += imageHTML.length;
    }
    
    return contentBeforeHeading + processedContent;
  }
}

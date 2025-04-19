
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
  
  // First try to find h2 tags to use as section breaks
  const h2Regex = /<h2[^>]*>/g;
  const h2Matches = Array.from(content.matchAll(h2Regex));
  
  // Find the first h1 or h2 tag (intro heading)
  const introHeadingRegex = /<h[12][^>]*>/;
  const introMatch = content.match(introHeadingRegex);
  
  if (introMatch) {
    // Get content after the introduction section
    const introEnd = introMatch.index! + introMatch[0].length;
    const firstParagraphRegex = /<\/p>/;
    const firstParagraphMatch = content.substring(introEnd).match(firstParagraphRegex);
    
    let contentStartIndex = introEnd;
    if (firstParagraphMatch) {
      contentStartIndex = introEnd + firstParagraphMatch.index! + 4; // 4 is the length of </p>
    }
    
    // Skip the introduction - start after the first paragraph following the heading
    const contentBeforeImages = content.substring(0, contentStartIndex);
    const contentForImages = content.substring(contentStartIndex);
    
    if (h2Matches.length >= imageCount) {
      // We have enough h2 tags to distribute images
      return insertImagesBeforeHeadings(contentBeforeImages, contentForImages, h2Matches, imageCount);
    } else {
      // Not enough h2 tags, use regular intervals
      return insertImagesAtRegularIntervals(contentBeforeImages, contentForImages, imageCount);
    }
  } else if (h2Matches.length > 0) {
    // No clear intro but we have h2 tags
    // Use the first h2 as the intro section
    const firstH2Index = h2Matches[0].index!;
    const firstParaAfterH2Regex = /<\/p>/;
    const firstParaAfterH2Match = content.substring(firstH2Index).match(firstParaAfterH2Regex);
    
    let contentStartIndex = firstH2Index;
    if (firstParaAfterH2Match) {
      contentStartIndex = firstH2Index + firstParaAfterH2Match.index! + 4;
    }
    
    const contentBeforeImages = content.substring(0, contentStartIndex);
    const contentForImages = content.substring(contentStartIndex);
    
    if (h2Matches.length > 1) {
      // Use remaining h2 tags for image distribution
      const remainingH2s = h2Matches.slice(1).map(match => {
        return {
          ...match,
          index: match.index! - contentStartIndex // Adjust index for the new substring
        };
      });
      
      return insertImagesBeforeHeadings(contentBeforeImages, contentForImages, remainingH2s, imageCount);
    } else {
      // Only one h2, use regular intervals
      return insertImagesAtRegularIntervals(contentBeforeImages, contentForImages, imageCount);
    }
  } else {
    // No headings at all - look for paragraphs as delimiters
    const paragraphRegex = /<\/p>/g;
    const paragraphMatches = Array.from(content.matchAll(paragraphRegex));
    
    if (paragraphMatches.length > 1) {
      // Skip the first paragraph (likely introduction)
      const firstParaIndex = paragraphMatches[0].index! + 4;
      const contentBeforeImages = content.substring(0, firstParaIndex);
      const contentForImages = content.substring(firstParaIndex);
      
      return insertImagesAfterParagraphs(contentBeforeImages, contentForImages, paragraphMatches.slice(1), imageCount);
    } else {
      // Not enough paragraphs, insert at reasonable intervals in the content
      const skipPercentage = 0.2; // Skip first 20% of content 
      const contentStartIndex = Math.floor(content.length * skipPercentage);
      
      const contentBeforeImages = content.substring(0, contentStartIndex);
      const contentForImages = content.substring(contentStartIndex);
      
      return insertImagesAtRegularIntervals(contentBeforeImages, contentForImages, imageCount);
    }
  }
}

/**
 * Insert images before heading tags
 */
function insertImagesBeforeHeadings(contentBeforeImages: string, contentForImages: string, headings: RegExpMatchArray[], imageCount: number): string {
  const distributionPoints = Math.min(headings.length, imageCount);
  let processedContent = contentForImages;
  let offset = 0;
  
  // Calculate which headings to use for even distribution
  for (let i = 0; i < distributionPoints; i++) {
    // Calculate heading indices with even spacing
    const headingIndex = Math.floor(i * headings.length / distributionPoints);
    if (headingIndex < headings.length) {
      const position = headings[headingIndex].index! + offset;
      const imageHTML = generateImagePlaceholder(i + 1);
      
      processedContent = 
        processedContent.substring(0, position) + 
        imageHTML + 
        processedContent.substring(position);
        
      offset += imageHTML.length;
    }
  }
  
  return contentBeforeImages + processedContent;
}

/**
 * Insert images after paragraphs
 */
function insertImagesAfterParagraphs(contentBeforeImages: string, contentForImages: string, paragraphs: RegExpMatchArray[], imageCount: number): string {
  const paragraphsToUse = Math.min(paragraphs.length, imageCount * 2); // Use more paragraphs than images
  let processedContent = contentForImages;
  let offset = 0;
  
  // Calculate which paragraphs to use for even distribution
  for (let i = 0; i < imageCount; i++) {
    // Calculate paragraph indices with even spacing
    const paragraphIndex = Math.floor((i + 1) * paragraphsToUse / (imageCount + 1));
    if (paragraphIndex < paragraphs.length) {
      const position = paragraphs[paragraphIndex].index! + 4 + offset; // 4 is the length of </p>
      const imageHTML = generateImagePlaceholder(i + 1);
      
      processedContent = 
        processedContent.substring(0, position) + 
        imageHTML + 
        processedContent.substring(position);
        
      offset += imageHTML.length;
    }
  }
  
  return contentBeforeImages + processedContent;
}

/**
 * Insert images at regular intervals in the content
 */
function insertImagesAtRegularIntervals(contentBeforeImages: string, contentForImages: string, imageCount: number): string {
  const contentLength = contentForImages.length;
  let processedContent = contentForImages;
  let offset = 0;
  
  // Distribute images evenly
  for (let i = 0; i < imageCount; i++) {
    const position = Math.floor((i + 1) * contentLength / (imageCount + 1)) + offset;
    
    // Find the nearest paragraph end to insert after
    const beforePos = processedContent.substring(0, position);
    const lastPara = beforePos.lastIndexOf('</p>');
    
    // Insert after a paragraph if possible, otherwise use calculated position
    const insertPosition = lastPara !== -1 && lastPara > position - 200 ? 
      lastPara + 4 : // After paragraph
      position;
      
    const imageHTML = generateImagePlaceholder(i + 1);
    
    processedContent = 
      processedContent.substring(0, insertPosition) + 
      imageHTML + 
      processedContent.substring(insertPosition);
      
    offset += imageHTML.length;
  }
  
  return contentBeforeImages + processedContent;
}

/**
 * Generate HTML for image placeholder
 */
function generateImagePlaceholder(imageNumber: number): string {
  return `<div class="section-image">
    <div class="image-placeholder" id="image-${imageNumber}">
      <p class="placeholder-text">Click to upload image ${imageNumber}</p>
    </div>
  </div>\n`;
}

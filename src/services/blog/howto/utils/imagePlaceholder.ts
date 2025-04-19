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
  
  // Find all h2 tags to use as section breaks
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
    
    // Get h2 tags after the introduction
    const h2MatchesAfterIntro = h2Matches.filter(match => match.index! >= contentStartIndex - introEnd);
    
    if (h2MatchesAfterIntro.length >= imageCount) {
      // We have enough h2 tags to distribute images
      return insertImagesBeforeHeadings(contentBeforeImages, contentForImages, h2MatchesAfterIntro, imageCount);
    } else if (h2MatchesAfterIntro.length > 0) {
      // Not enough h2 tags, but we have some - use them and distribute evenly
      return insertImagesEvenly(contentBeforeImages, contentForImages, h2MatchesAfterIntro, imageCount);
    } else {
      // No h2 tags, use regular intervals with paragraphs
      return insertImagesAtRegularIntervals(contentBeforeImages, contentForImages, imageCount);
    }
  } else if (h2Matches.length > 0) {
    // No clear intro but we have h2 tags - use them directly
    return insertImagesBeforeHeadings('', content, h2Matches, imageCount);
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
 * Insert images before heading tags - IMPROVED to ensure they're before h2 tags
 */
function insertImagesBeforeHeadings(contentBeforeImages: string, contentForImages: string, headings: RegExpMatchArray[], imageCount: number): string {
  // Only use h2 headings for image placement
  const h2Headings = headings.filter(h => {
    const tagMatch = h[0].match(/<(h[1-6])[^>]*>/);
    return tagMatch && tagMatch[1] === 'h2';
  });
  
  if (h2Headings.length === 0) {
    return insertImagesAtRegularIntervals(contentBeforeImages, contentForImages, imageCount);
  }
  
  const distributionPoints = Math.min(h2Headings.length, imageCount);
  let processedContent = contentForImages;
  let offset = 0;
  
  // Sort headings by their position
  const sortedHeadings = [...h2Headings].sort((a, b) => a.index! - b.index!);
  
  // Calculate which headings to use for even distribution
  const selectedIndices = [];
  
  if (distributionPoints === 1) {
    // If only one image, put it before the first h2
    selectedIndices.push(0);
  } else {
    // Distribute evenly
    for (let i = 0; i < distributionPoints; i++) {
      const headingIndex = Math.floor(i * (sortedHeadings.length - 1) / (distributionPoints - 1));
      selectedIndices.push(headingIndex);
    }
  }
  
  // Remove duplicates and sort
  const uniqueIndices = [...new Set(selectedIndices)].sort((a, b) => a - b);
  
  // Insert images before the selected h2 headings
  for (let i = 0; i < uniqueIndices.length && i < imageCount; i++) {
    const headingIndex = uniqueIndices[i];
    if (headingIndex < sortedHeadings.length) {
      const position = sortedHeadings[headingIndex].index! + offset;
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
 * Insert images evenly using available h2 tags and paragraphs
 */
function insertImagesEvenly(contentBeforeImages: string, contentForImages: string, headings: RegExpMatchArray[], imageCount: number): string {
  // Filter to only h2 headings
  const h2Headings = headings.filter(h => {
    const tagMatch = h[0].match(/<(h[1-6])[^>]*>/);
    return tagMatch && tagMatch[1] === 'h2';
  });
  
  let processedContent = contentForImages;
  let offset = 0;
  
  // Use the available h2 tags first
  for (let i = 0; i < Math.min(h2Headings.length, imageCount); i++) {
    const position = h2Headings[i].index! + offset;
    const imageHTML = generateImagePlaceholder(i + 1);
    
    processedContent = 
      processedContent.substring(0, position) + 
      imageHTML + 
      processedContent.substring(position);
      
    offset += imageHTML.length;
  }
  
  // If we need more images than h2 tags, find suitable paragraph breaks
  if (imageCount > h2Headings.length) {
    const paragraphRegex = /<\/p>/g;
    const remainingImages = imageCount - h2Headings.length;
    
    // Find paragraphs in the processed content
    const updatedContent = processedContent;
    const paragraphs = Array.from(updatedContent.matchAll(paragraphRegex));
    
    // Skip paragraphs near the already inserted images
    const safeDistance = 500; // characters
    const imagePositions = h2Headings.map(h => h.index! + offset);
    
    const safeParagraphs = paragraphs.filter(p => {
      const paraPos = p.index!;
      return !imagePositions.some(imgPos => Math.abs(paraPos - imgPos) < safeDistance);
    });
    
    // Calculate spacing for remaining images
    const contentLength = updatedContent.length;
    const sectionSize = contentLength / (remainingImages + 1);
    
    // Place remaining images
    for (let i = 0; i < remainingImages; i++) {
      const targetPosition = Math.floor((i + 1) * sectionSize);
      
      // Find the nearest safe paragraph
      let nearestPara = -1;
      let minDistance = Infinity;
      
      for (let j = 0; j < safeParagraphs.length; j++) {
        const paraPos = safeParagraphs[j].index!;
        const distance = Math.abs(paraPos - targetPosition);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestPara = j;
        }
      }
      
      if (nearestPara >= 0) {
        const position = safeParagraphs[nearestPara].index! + 4; // after </p>
        const imageHTML = generateImagePlaceholder(h2Headings.length + i + 1);
        
        processedContent = 
          processedContent.substring(0, position) + 
          imageHTML + 
          processedContent.substring(position);
          
        offset += imageHTML.length;
      }
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

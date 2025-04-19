
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
 * Distribute image placeholders evenly throughout the content,
 * placing them before new sections (h2, h3, qa-items, step-containers)
 */
export function distributeImagesBeforeSections(content: string, imageCount: number): string {
  if (!content || imageCount <= 0) return content;
  
  // Find all section break points (headings, Q&A items, step containers)
  const sectionBreakRegex = /<h[23][^>]*>|<div class="qa-item">|<div class="step-container">/g;
  const matches = [...content.matchAll(sectionBreakRegex)];
  
  // If no section breaks or too few, return original content
  if (matches.length <= 1) return content;
  
  // Calculate distribution points - we want to place images evenly before sections
  // Skip the first heading (usually the title) and distribute images before later sections
  const startIndex = 1; // Skip the first heading (title)
  
  // Choose breakpoints evenly throughout the sections
  const step = Math.max(1, Math.floor((matches.length - startIndex) / imageCount));
  let modifiedContent = content;
  let insertedImages = 0;
  
  // Create image placeholders
  const createImagePlaceholder = (index: number) => {
    return `\n<div class="image-placeholder blog-section-image" id="image-${index + 1}">
  <p class="placeholder-text">Click to upload image ${index + 1}</p>
</div>\n`;
  };
  
  // Insert images before selected section breaks
  for (let i = startIndex; i < matches.length && insertedImages < imageCount; i += step) {
    const match = matches[i];
    if (match && match.index !== undefined) {
      const placeholder = createImagePlaceholder(insertedImages);
      modifiedContent = 
        modifiedContent.substring(0, match.index) + 
        placeholder +
        modifiedContent.substring(match.index);
      
      // Adjust subsequent match indices to account for the inserted content
      for (let j = i + 1; j < matches.length; j++) {
        if (matches[j].index !== undefined) {
          matches[j].index += placeholder.length;
        }
      }
      
      insertedImages++;
    }
  }
  
  // If we still have images left to place, put them at regular intervals in the remaining content
  if (insertedImages < imageCount) {
    const remainingImages = imageCount - insertedImages;
    const contentChunks = Math.min(remainingImages + 1, 4); // Split into at most 4 sections
    const contentLength = modifiedContent.length;
    const chunkSize = Math.floor(contentLength / contentChunks);
    
    for (let i = 0; i < remainingImages; i++) {
      const position = Math.min(
        contentLength - 1, 
        chunkSize * (i + 1)
      );
      
      // Find the next paragraph end or div end after the target position
      const nextBreakMatch = modifiedContent.substring(position).match(/<\/p>|<\/div>/);
      if (nextBreakMatch) {
        const breakPosition = position + nextBreakMatch.index! + nextBreakMatch[0].length;
        const placeholder = createImagePlaceholder(insertedImages + i);
        
        modifiedContent = 
          modifiedContent.substring(0, breakPosition) + 
          placeholder +
          modifiedContent.substring(breakPosition);
      }
    }
  }
  
  return modifiedContent;
}


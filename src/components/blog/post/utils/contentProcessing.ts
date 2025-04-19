
/**
 * Fixes HTML in Top10 blog posts to ensure proper tag closure
 */
export const fixTopTenHtmlIfNeeded = (content: string, category: string): string => {
  if (category !== 'Top10') return content;
  
  // Check if there are unclosed tags in the content
  let processedContent = content;
  
  // Ensure h1 tags are properly formatted
  processedContent = processedContent.replace(/<h1([^>]*)>([^<]*?)(?=<(?!\/h1>))/g, '<h1$1>$2</h1>');
  
  // Ensure h3 tags are properly formatted
  processedContent = processedContent.replace(/<h3>([^<]*?)(?=<(?!\/h3>))/g, '<h3>$1</h3>');
  
  // Fix paragraph tags
  processedContent = processedContent.replace(/<p>([^<]*?)(?=<(?!\/p>))/g, '<p>$1</p>');
  
  // Fix list items
  processedContent = processedContent.replace(/<li>([^<]*?)(?=<(?!\/li>))/g, '<li>$1</li>');
  
  // Ensure proper list tag closure
  processedContent = processedContent.replace(/<ul class="my-4">([^]*?)(?=<(?!\/ul>))/g, '<ul class="my-4">$1</ul>');
  
  return processedContent;
};

/**
 * Injects additional images into the blog post content at appropriate positions after sections
 */
export const injectAdditionalImages = (content: string, additionalImages: string[] | undefined, category?: string): string => {
  if (!additionalImages || additionalImages.length === 0) return content;
  
  if (category === 'Top10') {
    let modifiedContent = content;
    const headers = content.match(/<h[2-3][^>]*>.*?<\/h[2-3]>/gi) || [];
    
    headers.forEach((header, index) => {
      if (index < additionalImages.length) {
        const imgSrc = additionalImages[index];
        const imageHtml = `<div class="my-4">
          <img 
            src="${imgSrc}" 
            alt="List item ${index + 1}" 
            class="rounded-lg w-full" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
          />
        </div>`;
        
        modifiedContent = modifiedContent.replace(
          header,
          `${header}${imageHtml}`
        );
      }
    });
    
    return modifiedContent;
  }
  
  if (['Review', 'How-To', 'Comparison'].includes(category || '')) {
    let modifiedContent = content;
    
    // For How-To posts, identify section breaks to place images after
    if (category === 'How-To') {
      // Find all section breaks (headings, step containers, qa items, or divs)
      const sectionBreakRegex = /<\/(?:h[1-6]|div class="step-container"|div class="qa-item"|section)[^>]*>/gi;
      const sectionBreaks = [...modifiedContent.matchAll(sectionBreakRegex)];
      
      // Also get paragraph breaks as potential insertion points if we don't have enough section breaks
      const paragraphBreaks = [...modifiedContent.matchAll(/<\/p>/gi)];
      const allBreakPoints = [...sectionBreaks];
      
      // Add paragraph breaks but only ones that are not too close to section breaks
      if (sectionBreaks.length < additionalImages.length * 2) {
        paragraphBreaks.forEach(paragraphBreak => {
          const paragraphPos = paragraphBreak.index!;
          // Only add if it's not too close to an existing section break
          if (sectionBreaks.every(sectionBreak => 
              Math.abs((sectionBreak.index || 0) - paragraphPos) > 300)) {
            allBreakPoints.push(paragraphBreak);
          }
        });
      }
      
      // Sort breaks by position
      allBreakPoints.sort((a, b) => (a.index || 0) - (b.index || 0));
      
      if (allBreakPoints.length > 0) {
        // Calculate content sections for even distribution
        const contentLength = modifiedContent.length;
        const sectionLength = contentLength / (additionalImages.length + 1);
        
        // Map of positions where we'll insert images
        const insertPositions = new Map();
        
        for (let imgIndex = 0; imgIndex < additionalImages.length; imgIndex++) {
          // Ideal position would be at (imgIndex + 1) * sectionLength
          const idealPosition = Math.floor((imgIndex + 1) * sectionLength);
          
          // Find the nearest break point after the ideal position
          let closestBreak = null;
          let minDistance = Number.MAX_SAFE_INTEGER;
          
          for (const breakPoint of allBreakPoints) {
            const breakPos = breakPoint.index! + breakPoint[0].length;
            if (breakPos > idealPosition) {
              const distance = breakPos - idealPosition;
              if (distance < minDistance) {
                minDistance = distance;
                closestBreak = breakPoint;
              }
            }
          }
          
          // If we found a suitable break point
          if (closestBreak) {
            const breakEndPosition = closestBreak.index! + closestBreak[0].length;
            
            // Avoid placing images too close to each other
            if ([...insertPositions.keys()].every(pos => Math.abs(pos - breakEndPosition) > 300)) {
              insertPositions.set(breakEndPosition, additionalImages[imgIndex]);
              
              // Remove this break point from consideration for future images
              allBreakPoints.splice(allBreakPoints.indexOf(closestBreak), 1);
            }
          }
        }
        
        // Insert images from end to beginning to avoid position shifting
        const positionsArray = [...insertPositions.entries()]
          .sort((a, b) => b[0] - a[0]); // Sort in descending order
        
        for (const [position, imgSrc] of positionsArray) {
          const imageHtml = `
          <div class="section-image-container">
            <img 
              src="${imgSrc}" 
              alt="Section illustration" 
              class="rounded-lg w-full" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
            />
          </div>`;
          
          modifiedContent = 
            modifiedContent.substring(0, position) + 
            imageHtml + 
            modifiedContent.substring(position);
        }
        
        return modifiedContent;
      }
    }
    
    // Fallback to original method if no section breaks found
    const paragraphs = content.match(/<p>.*?<\/p>/gi) || [];
    
    additionalImages.forEach((img, index) => {
      const targetParagraphIndex = Math.min(
        Math.floor(paragraphs.length * (index + 1) / (additionalImages.length + 1)),
        paragraphs.length - 1
      );
      
      if (targetParagraphIndex >= 0 && paragraphs[targetParagraphIndex]) {
        const imageHtml = `<div class="my-4">
          <img 
            src="${img}" 
            alt="Image ${index + 1}" 
            class="rounded-lg w-full" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
          />
        </div>`;
        
        modifiedContent = modifiedContent.replace(
          paragraphs[targetParagraphIndex],
          `${paragraphs[targetParagraphIndex]}${imageHtml}`
        );
      }
    });
    
    return modifiedContent;
  }
  
  return content;
};

/**
 * Add fallback handlers to img tags
 */
export const addImageFallbacks = (content: string): string => {
  return content.replace(
    /<img([^>]*)>/g, 
    '<img$1 onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200\';">'
  );
};

/**
 * Improves paragraph spacing in blog content, especially for emoji-prefixed paragraphs
 */
export const improveContentSpacing = (content: string): string => {
  let improvedContent = content;
  
  // Fix spacing for emoji-prefixed paragraphs
  improvedContent = improvedContent.replace(
    /(<p>[📱🌟💻✅🚀💡✨🔥👉][^<]*?<\/p>)(<p>)/g, 
    '$1\n<div class="my-6"></div>$2'
  );
  
  // Add additional spacing between regular paragraphs if they don't have it
  improvedContent = improvedContent.replace(
    /(<\/p>)(<p>)/g,
    '$1\n<div class="my-4"></div>$2'
  );
  
  // Add spacing before bullet lists
  improvedContent = improvedContent.replace(
    /(<\/p>)(<ul)/g,
    '$1\n<div class="my-4"></div>$2'
  );
  
  // IMPROVED: Add better spacing after bullet lists
  // Increase spacing from my-4 to my-6 (from 16px to 24px) for better visual separation
  improvedContent = improvedContent.replace(
    /(<\/ul>)(\s*)(<p>)/g,
    '$1\n<div class="my-6"></div>$3'
  );
  
  // Ensure emoji bullets have proper spacing
  improvedContent = improvedContent.replace(
    /<p>(✅[^<]*?)<\/p>/g,
    '<p class="flex items-start mb-2"><span class="mr-2 flex-shrink-0">✅</span><span>$1</span></p>'
  );
  
  return improvedContent;
};

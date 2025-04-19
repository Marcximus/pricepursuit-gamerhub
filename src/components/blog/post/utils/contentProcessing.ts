
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
 * Injects additional images into the blog post content at appropriate positions
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
    
    // Improved section distribution for How-To blog posts
    // Get all major content breakpoints (h2, h3 sections and paragraphs)
    const contentBreakpoints = [
      ...Array.from(content.matchAll(/<h2[^>]*>.*?<\/h2>/gi)).map(m => ({
        type: 'h2',
        index: m.index || 0,
        content: m[0]
      })),
      ...Array.from(content.matchAll(/<h3[^>]*>.*?<\/h3>/gi)).map(m => ({
        type: 'h3',
        index: m.index || 0,
        content: m[0]
      }))
    ];
    
    // Sort breakpoints by their position in the document
    contentBreakpoints.sort((a, b) => a.index - b.index);
    
    // If we have more images than breakpoints, we'll need to distribute differently
    if (contentBreakpoints.length === 0) {
      // Fall back to paragraph distribution if no headings
      const paragraphs = Array.from(content.matchAll(/<p[^>]*>.*?<\/p>/gi));
      
      // Only place images if there are paragraphs
      if (paragraphs.length > 0) {
        additionalImages.forEach((img, index) => {
          // Evenly distribute images among paragraphs
          const paragraphIndex = Math.floor(paragraphs.length * (index + 1) / (additionalImages.length + 1));
          
          if (paragraphIndex < paragraphs.length) {
            const paragraph = paragraphs[paragraphIndex];
            const imageHtml = `
            <div class="blog-image-container">
              <img 
                src="${img}" 
                alt="Image ${index + 1}" 
                class="rounded-lg mx-auto" 
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
              />
            </div>`;
            
            // Insert after this paragraph
            const matchPosition = paragraph.index || 0;
            const matchLength = paragraph[0].length;
            const insertPosition = matchPosition + matchLength;
            
            modifiedContent = 
              modifiedContent.substring(0, insertPosition) + 
              imageHtml + 
              modifiedContent.substring(insertPosition);
          }
        });
      }
    } else {
      // Distribute images across content sections more evenly
      const distribution = Math.ceil(contentBreakpoints.length / Math.min(additionalImages.length, 3));
      
      additionalImages.forEach((img, index) => {
        const breakpointIndex = Math.min(index * distribution, contentBreakpoints.length - 1);
        if (breakpointIndex < contentBreakpoints.length) {
          const breakpoint = contentBreakpoints[breakpointIndex];
          
          // Find the end of this section (next heading or end of content)
          let sectionEndIndex = modifiedContent.length;
          if (breakpointIndex + 1 < contentBreakpoints.length) {
            sectionEndIndex = contentBreakpoints[breakpointIndex + 1].index;
          }
          
          // Get the section content to find a good insertion point
          const sectionStartIndex = breakpoint.index + breakpoint.content.length;
          const sectionContent = modifiedContent.substring(sectionStartIndex, sectionEndIndex);
          
          // Look for a paragraph or list end to insert after
          const insertAfterMatch = sectionContent.match(/<\/p>|<\/ul>|<\/ol>/i);
          let insertPosition = sectionStartIndex;
          
          if (insertAfterMatch && insertAfterMatch.index !== undefined) {
            insertPosition = sectionStartIndex + insertAfterMatch.index + insertAfterMatch[0].length;
          }
          
          // Create image HTML
          const imageHtml = `
          <div class="blog-image-container">
            <img 
              src="${img}" 
              alt="${breakpoint.type === 'h2' ? 'Section' : 'Subsection'} image ${index + 1}" 
              class="rounded-lg mx-auto" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
            />
          </div>`;
          
          // Insert the image
          modifiedContent = 
            modifiedContent.substring(0, insertPosition) + 
            imageHtml + 
            modifiedContent.substring(insertPosition);
        }
      });
    }
    
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

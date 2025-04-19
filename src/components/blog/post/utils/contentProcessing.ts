
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
    
    // IMPROVED: Better distribution algorithm for How-To blog posts
    
    // Get all major content breakpoints (h2, h3 sections)
    const headings = [
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
    headings.sort((a, b) => a.index - b.index);
    
    // If we have no headings, fall back to paragraph distribution
    if (headings.length === 0) {
      const paragraphs = Array.from(content.matchAll(/<p[^>]*>.*?<\/p>/gi));
      
      // Only place images if there are paragraphs
      if (paragraphs.length > 0) {
        // Distribute images evenly across paragraphs
        additionalImages.forEach((img, index) => {
          // Calculate paragraph position for even distribution
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
      // NEW IMPROVED ALGORITHM: Ensure even distribution throughout all sections
      // Calculate ideal image positions for truly even distribution
      
      // Determine total document length for positioning reference
      const documentLength = content.length;
      const totalImages = additionalImages.length;
      
      // Skip first heading to avoid placing an image right at the start
      const effectiveHeadings = [...headings];
      if (effectiveHeadings.length > 2) {
        effectiveHeadings.shift(); // Remove the first heading (usually title)
      }
      
      // Place images at evenly spaced intervals through the document
      additionalImages.forEach((img, index) => {
        // Calculate ideal position as a percentage through the document
        const idealPosition = documentLength * (index + 1) / (totalImages + 1);
        
        // Find the nearest heading after this position
        const nearestHeadingAfter = effectiveHeadings.find(h => h.index > idealPosition);
        
        // Find the nearest paragraph after this position as a fallback
        const paragraphsAfter = Array.from(content.matchAll(/<p[^>]*>.*?<\/p>/gi))
          .filter(p => (p.index || 0) > idealPosition);
        const nearestParagraph = paragraphsAfter.length > 0 ? paragraphsAfter[0] : null;
        
        // Choose insertion point - prefer after a heading, fall back to after a paragraph
        let insertPosition = idealPosition;
        
        if (nearestHeadingAfter) {
          // Get the end of the section content (next heading or end of content)
          const sectionStartIndex = nearestHeadingAfter.index;
          
          // Look for a paragraph in this section to insert after
          const sectionContent = content.substring(sectionStartIndex);
          const firstParagraph = sectionContent.match(/<p[^>]*>.*?<\/p>/i);
          
          if (firstParagraph && firstParagraph.index !== undefined) {
            insertPosition = sectionStartIndex + firstParagraph.index + firstParagraph[0].length;
          } else {
            // If no paragraph found, insert right after the heading
            insertPosition = sectionStartIndex + nearestHeadingAfter.content.length;
          }
        } else if (nearestParagraph) {
          // No heading found near ideal position, use paragraph instead
          insertPosition = (nearestParagraph.index || 0) + nearestParagraph[0].length;
        }
        
        // Create image HTML
        const imageHtml = `
        <div class="blog-image-container">
          <img 
            src="${img}" 
            alt="Content image ${index + 1}" 
            class="rounded-lg mx-auto" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
          />
        </div>`;
        
        // Insert the image at the calculated position
        modifiedContent = 
          modifiedContent.substring(0, insertPosition) + 
          imageHtml + 
          modifiedContent.substring(insertPosition);
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

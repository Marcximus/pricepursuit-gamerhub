
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
    
    // For How-To, find section headings to place images before
    if (category === 'How-To') {
      const sectionBreaks = content.match(/<h[23][^>]*>|<div class="qa-item">|<div class="step-container">/gi) || [];
      
      if (sectionBreaks.length > 1) {
        // Skip the first heading (usually the title)
        const startIndex = 1;
        const step = Math.max(1, Math.floor((sectionBreaks.length - startIndex) / additionalImages.length));
        
        additionalImages.forEach((img, imageIndex) => {
          const sectionIndex = startIndex + (imageIndex * step);
          if (sectionBreaks[sectionIndex]) {
            const sectionBreak = sectionBreaks[sectionIndex];
            const sectionPos = modifiedContent.indexOf(sectionBreak);
            
            if (sectionPos !== -1) {
              const imageHtml = `<div class="my-6">
                <img 
                  src="${img}" 
                  alt="Image ${imageIndex + 1}" 
                  class="rounded-lg w-full blog-image" 
                  onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
                />
              </div>`;
              
              modifiedContent = 
                modifiedContent.substring(0, sectionPos) + 
                imageHtml + 
                modifiedContent.substring(sectionPos);
              
              // Adjust indices for subsequent insertions
              for (let j = imageIndex + 1; j < sectionBreaks.length; j++) {
                const breakPos = modifiedContent.indexOf(sectionBreaks[j], sectionPos + 1);
                if (breakPos !== -1) {
                  sectionBreaks[j] = modifiedContent.substring(breakPos, breakPos + sectionBreaks[j].length);
                }
              }
            }
          }
        });
        
        return modifiedContent;
      }
    }
    
    // Default behavior for other categories or if section breaks not found
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
  
  // Add better spacing after bullet lists
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

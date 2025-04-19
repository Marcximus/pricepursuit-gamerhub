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
  
  if (category === 'How-To') {
    let modifiedContent = content;
    
    const placeholderRegex = /<div class="image-placeholder" id="image-(\d+)"[^>]*>.*?<\/div>/gs;
    const placeholders = Array.from(modifiedContent.matchAll(placeholderRegex));
    
    if (placeholders.length > 0) {
      console.log(`Found ${placeholders.length} placeholders to replace with ${additionalImages.length} images`);
      
      const imagesToUse = Math.min(placeholders.length, additionalImages.length);
      
      for (let i = 0; i < imagesToUse; i++) {
        const imgSrc = additionalImages[i];
        const imageHtml = `<img 
          src="${imgSrc}" 
          alt="How-to guide image ${i + 1}" 
          class="rounded-lg w-full how-to-image" 
          onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
        />`;
        
        const placeholder = placeholders[i][0];
        modifiedContent = modifiedContent.replace(placeholder, imageHtml);
      }
      
      return modifiedContent;
    }
    
    if (placeholders.length === 0 && additionalImages.length > 0) {
      console.log('No placeholders found, adding images before h2 tags');
      
      const h2Regex = /<h2[^>]*>/g;
      const h2Tags = Array.from(modifiedContent.matchAll(h2Regex));
      
      const introHeadingRegex = /<h[12][^>]*>/;
      const introMatch = modifiedContent.match(introHeadingRegex);
      
      if (introMatch && h2Tags.length >= additionalImages.length) {
        const introEnd = introMatch.index! + introMatch[0].length;
        const h2TagsAfterIntro = h2Tags.filter(tag => tag.index! > introEnd);
        
        if (h2TagsAfterIntro.length >= additionalImages.length) {
          let offset = 0;
          
          for (let i = 0; i < additionalImages.length; i++) {
            const tagIndex = Math.floor(i * h2TagsAfterIntro.length / additionalImages.length);
            if (tagIndex < h2TagsAfterIntro.length) {
              const h2Match = h2TagsAfterIntro[tagIndex];
              const imgSrc = additionalImages[i];
              const position = h2Match.index! + offset;
              
              const imageHtml = `<div class="section-image">
                <img 
                  src="${imgSrc}" 
                  alt="How-to guide image ${i + 1}" 
                  class="rounded-lg w-full how-to-image" 
                  onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
                />
              </div>\n`;
              
              modifiedContent = 
                modifiedContent.substring(0, position) + 
                imageHtml + 
                modifiedContent.substring(position);
                
              offset += imageHtml.length;
              console.log(`Added image ${i+1} at position ${position} before h2 tag`);
            }
          }
          
          return modifiedContent;
        }
      }
      
      const paragraphRegex = /<\/p>/g;
      const paragraphs = Array.from(modifiedContent.matchAll(paragraphRegex));
      
      if (paragraphs.length > additionalImages.length + 1) {
        let usableParagraphs = paragraphs.slice(1);
        let offset = 0;
        
        for (let i = 0; i < additionalImages.length; i++) {
          const paragraphIndex = Math.floor((i + 1) * usableParagraphs.length / (additionalImages.length + 1));
          
          if (paragraphIndex < usableParagraphs.length) {
            const paraMatch = usableParagraphs[paragraphIndex];
            const imgSrc = additionalImages[i];
            const position = paraMatch.index! + 4 + offset;
            
            const imageHtml = `<div class="section-image">
              <img 
                src="${imgSrc}" 
                alt="How-to guide image ${i + 1}" 
                class="rounded-lg w-full how-to-image" 
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
              />
            </div>\n`;
            
            modifiedContent = 
              modifiedContent.substring(0, position) + 
              imageHtml + 
              modifiedContent.substring(position);
              
            offset += imageHtml.length;
            console.log(`Added image ${i+1} after paragraph ${paragraphIndex}`);
          }
        }
      } else {
        const contentLength = modifiedContent.length;
        let skipPercentage = 0.2;
        let offset = 0;
        
        for (let i = 0; i < additionalImages.length; i++) {
          const imgSrc = additionalImages[i];
          const position = Math.floor(contentLength * skipPercentage) + 
            Math.floor((i + 1) * contentLength * (1 - skipPercentage) / (additionalImages.length + 1)) + 
            offset;
          
          const imageHtml = `<div class="section-image">
            <img 
              src="${imgSrc}" 
              alt="How-to guide image ${i + 1}" 
              class="rounded-lg w-full how-to-image" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
            />
          </div>\n`;
          
          modifiedContent = 
            modifiedContent.substring(0, position) + 
            imageHtml + 
            modifiedContent.substring(position);
            
          offset += imageHtml.length;
          console.log(`Added image ${i+1} at position ${position}`);
        }
      }
      
      return modifiedContent;
    }
  }
  
  if (['Review', 'Comparison'].includes(category || '')) {
    let modifiedContent = content;
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
  
  improvedContent = improvedContent.replace(
    /(<p>[📱🌟💻✅🚀💡✨🔥👉][^<]*?<\/p>)(<p>)/g, 
    '$1\n<div class="my-6"></div>$2'
  );
  
  improvedContent = improvedContent.replace(
    /(<\/p>)(<p>)/g,
    '$1\n<div class="my-4"></div>$2'
  );
  
  improvedContent = improvedContent.replace(
    /(<\/p>)(<ul)/g,
    '$1\n<div class="my-4"></div>$2'
  );
  
  improvedContent = improvedContent.replace(
    /(<\/ul>)(\s*)(<p>)/g,
    '$1\n<div class="my-6"></div>$3'
  );
  
  improvedContent = improvedContent.replace(
    /<p>(✅[^<]*?)<\/p>/g,
    '<p class="flex items-start mb-2"><span class="mr-2 flex-shrink-0">✅</span><span>$1</span></p>'
  );
  
  return improvedContent;
};

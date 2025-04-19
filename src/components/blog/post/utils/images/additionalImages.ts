
/**
 * Handles injection of additional images into blog post content
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


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
    // For How-To blogs, replace any existing image placeholders with actual images
    let modifiedContent = content;
    
    // Find all image placeholders
    const placeholderRegex = /<div class="image-placeholder" id="image-(\d+)"[^>]*>.*?<\/div>/gs;
    const placeholders = Array.from(modifiedContent.matchAll(placeholderRegex));
    
    // If we found placeholders, replace them with actual images
    if (placeholders.length > 0) {
      console.log(`Found ${placeholders.length} placeholders to replace with images`);
      
      placeholders.forEach((match, index) => {
        if (index < additionalImages.length) {
          const imgSrc = additionalImages[index];
          const imageHtml = `<img 
            src="${imgSrc}" 
            alt="How-to guide image ${index + 1}" 
            class="rounded-lg w-full how-to-image" 
            onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
          />`;
          
          modifiedContent = modifiedContent.replace(
            match[0],
            imageHtml
          );
        }
      });
      
      return modifiedContent;
    }
    
    // If there are no placeholders but we have additional images, inject them before h2 tags
    // BUT skip the first h2 which is typically part of the intro section
    if (placeholders.length === 0 && additionalImages.length > 0) {
      console.log('No placeholders found, adding images before h2 tags');
      
      // Find all h2 tags
      const h2Regex = /<h2[^>]*>/g;
      const h2Tags = Array.from(modifiedContent.matchAll(h2Regex));
      
      // If we have h2 tags, place images before them, skipping the first one
      if (h2Tags.length > 1) {
        let offset = 0;
        
        // Start from the second h2 tag (skip first one which belongs to intro)
        const tagsToUse = h2Tags.slice(1);
        const imageCount = Math.min(additionalImages.length, tagsToUse.length);
        
        for (let i = 0; i < imageCount; i++) {
          // Calculate which h2 to use for even distribution
          const tagIndex = Math.floor((i * tagsToUse.length) / imageCount);
          
          if (tagIndex < tagsToUse.length) {
            const h2Match = tagsToUse[tagIndex];
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
            console.log(`Added image at position ${position} before h2 tag`);
          }
        }
      } else if (h2Tags.length === 1) {
        // If there's only one h2 tag, distribute the images throughout the content
        console.log('Only one h2 tag found, distributing images evenly in content');
        const contentLength = modifiedContent.length;
        const h2Position = h2Tags[0].index!;
        
        // Skip the first section (before the h2)
        // Place images in the remaining content
        const afterH2Content = modifiedContent.substring(h2Position);
        const remainingLength = afterH2Content.length;
        
        for (let i = 0; i < Math.min(additionalImages.length, 3); i++) {
          const imgSrc = additionalImages[i];
          // Calculate position in the content after the h2
          const relativePosition = Math.floor((remainingLength * (i + 1)) / 4); // divide into 4 parts
          const absolutePosition = h2Position + relativePosition;
          
          // Find a good place to insert (after a paragraph)
          const nextParagraphEnd = modifiedContent.indexOf('</p>', absolutePosition);
          const insertPosition = nextParagraphEnd !== -1 ? nextParagraphEnd + 4 : absolutePosition;
          
          const imageHtml = `<div class="section-image">
            <img 
              src="${imgSrc}" 
              alt="How-to guide image ${i + 1}" 
              class="rounded-lg w-full how-to-image" 
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200';"
            />
          </div>\n`;
          
          modifiedContent = 
            modifiedContent.substring(0, insertPosition) + 
            imageHtml + 
            modifiedContent.substring(insertPosition);
            
          console.log(`Added image at position ${insertPosition} in the content`);
        }
      }
    }
    
    return modifiedContent;
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

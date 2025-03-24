/**
 * Content processing utilities for blog posts
 */

import type { BlogPost } from '@/contexts/blog';

/**
 * Fix Top10 HTML formatting if needed
 */
export function fixTopTenHtmlIfNeeded(content: string, category: string): string {
  if (category !== 'Top10') return content;
  
  let fixedContent = content;
  
  // Fix h3 tags that don't have proper closing tags
  fixedContent = fixedContent.replace(/<h3([^>]*)>([^<]+)(?!<\/h3>)/g, '<h3$1>$2</h3>');
  
  // Fix p tags that don't have proper closing tags
  fixedContent = fixedContent.replace(/<p>([^<]+)(?!<\/p>)/g, '<p>$1</p>');
  
  // Fix ul tags that don't have proper closing tags
  fixedContent = fixedContent.replace(/<ul([^>]*)>([^<]+)(?!<\/ul>)/g, '<ul$1>$2</ul>');
  
  // Fix li tags that don't have proper closing tags
  fixedContent = fixedContent.replace(/<li>([^<]+)(?!<\/li>)/g, '<li>$1</li>');
  
  return fixedContent;
}

/**
 * Add image fallbacks
 */
export function addImageFallbacks(content: string): string {
  // Add onerror handler to images that don't already have one
  return content.replace(
    /<img([^>]*)(?!onerror=)([^>]*)>/g, 
    '<img$1$2 onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80\'; this.classList.add(\'fallback-image\');">'
  );
}

/**
 * Inject additional images into the content
 */
export function injectAdditionalImages(
  content: string, 
  additionalImages: string[] | null, 
  category: string
): string {
  if (!additionalImages || additionalImages.length === 0) return content;
  
  let modifiedContent = content;
  
  // Only inject for certain categories
  if (['How-To', 'News'].includes(category)) {
    const paragraphs = content.match(/<p>.*?<\/p>/gs) || [];
    
    // Inject after some paragraphs
    additionalImages.forEach((imageUrl, index) => {
      const targetIndex = Math.min(paragraphs.length - 1, 2 + index * 3);
      if (targetIndex >= 0 && paragraphs[targetIndex]) {
        const imgHtml = `
          <figure class="my-6">
            <img src="${imageUrl}" alt="Article image ${index + 1}" class="rounded-lg w-full max-w-3xl mx-auto" />
          </figure>
        `;
        modifiedContent = modifiedContent.replace(
          paragraphs[targetIndex],
          `${paragraphs[targetIndex]}${imgHtml}`
        );
      }
    });
  }
  
  return modifiedContent;
}

/**
 * Improve spacing between paragraphs and sections
 */
export function improveContentSpacing(content: string): string {
  let enhancedContent = content;
  
  // Add attributes to paragraphs that start with emojis to improve their styling
  enhancedContent = enhancedContent.replace(
    /<p>(\s*[🌟🚀💡📱💻🔥✨⭐🎮🌊🎒💼🖥️☕].*?)<\/p>/g, 
    '<p emoji-prefix="true">$1</p>'
  );
  
  // Fix common spacing issues
  enhancedContent = enhancedContent
    // Add space after period if missing
    .replace(/\.([A-Z])/g, '. $1')
    // Add space after comma if missing
    .replace(/,([A-Za-z])/g, ', $1')
    // Remove excess whitespace between paragraphs
    .replace(/>\s+</g, '><')
    // Add breathing room around horizontal rules
    .replace(/<hr\s*\/?>/g, '<hr class="my-8" />');
  
  // Remove excessively long product titles that might have been included
  enhancedContent = enhancedContent.replace(
    /<h3>.*?(\w+\s+\w+\s+\w+).*?<\/h3>/g,
    (match, shortTitle) => {
      // Keep only the first few words for the title
      return `<h3>${shortTitle}</h3>`;
    }
  );
  
  return enhancedContent;
}

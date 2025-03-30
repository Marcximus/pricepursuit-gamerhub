
/**
 * HTML-related content processing utilities for Top10 blog posts
 */

/**
 * Clean up content to ensure proper formatting
 */
export function cleanupContent(content: string): string {
  if (!content) return '';
  
  // Remove excess spacing
  let cleaned = content.replace(/\n{3,}/g, '\n\n');
  
  // Fix common HTML issues
  cleaned = cleaned
    // Fix multiple opening tags
    .replace(/(<h[1-6]>)\s*(<h[1-6]>)/g, '$1')
    // Fix missing closing tags
    .replace(/<(h[1-6])>(.*?)(?!<\/\1>)(<h[1-6]>)/g, '<$1>$2</$1>$3')
    // Ensure proper paragraph spacing
    .replace(/<\/p><p>/g, '</p>\n<p>');
  
  return cleaned;
}

/**
 * Fix common HTML tag issues
 */
export function fixHtmlTags(content: string): string {
  if (!content) return '';
  
  // Replace encoded characters
  let fixed = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Fix double closing tags
  fixed = fixed
    .replace(/<\/([^>]+)><\/\1>/g, '</$1>')
    .replace(/<\/p><\/p>/g, '</p>')
    .replace(/<\/h[1-6]><\/h[1-6]>/g, '</h$1>');
  
  // Fix unclosed tags
  const commonTags = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'];
  commonTags.forEach(tag => {
    const openCount = (fixed.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
    const closeCount = (fixed.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    
    if (openCount > closeCount) {
      // Add missing closing tags
      for (let i = 0; i < openCount - closeCount; i++) {
        fixed += `</${tag}>`;
      }
    }
  });
  
  return fixed;
}

/**
 * Fix Top10 HTML content if needed
 */
export function fixTopTenHtmlIfNeeded(content: string, category: string): string {
  if (category !== 'Top10' || !content) return content;
  
  // Apply HTML fixes for Top10 content
  let fixedContent = cleanupContent(content);
  fixedContent = fixHtmlTags(fixedContent);
  
  return fixedContent;
}

/**
 * Add image fallbacks
 */
export function addImageFallbacks(content: string): string {
  if (!content) return content;
  
  // Add onerror handler to all images
  return content.replace(
    /<img([^>]*)>/g, 
    '<img$1 onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80\'; this.classList.add(\'fallback-image\');">'
  );
}

/**
 * Improve content spacing
 */
export function improveContentSpacing(content: string): string {
  if (!content) return content;
  
  // Add proper margins between sections
  return content
    .replace(/(<\/h[1-6]>)(?!\s*<p>|\s*<ul>|\s*<ol>|\s*<div>)/g, '$1\n<p>&nbsp;</p>\n')
    .replace(/(<\/ul>|<\/ol>)(?!\s*<p>|\s*<h[1-6]>|\s*<div>)/g, '$1\n<p>&nbsp;</p>\n');
}

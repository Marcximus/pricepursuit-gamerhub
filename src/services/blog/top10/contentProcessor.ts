
/**
 * Content processing utilities for Top10 blog posts
 */
import { toast } from '@/components/ui/use-toast';

/**
 * Remove JSON formatting from content if present
 */
export function removeJsonFormatting(content: string): string {
  if (!content) return '';
  
  // Check if the content has JSON code block formatting
  if (content.startsWith('```json')) {
    console.log('🧹 Removing JSON formatting from content...');
    
    try {
      // Remove the code block markers
      let cleanedContent = content
        .replace(/^```json\s*\n/, '')
        .replace(/```\s*$/, '');
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleanedContent);
      
      // If successful, use the content property
      if (parsed && parsed.content) {
        console.log('✅ JSON formatting removed successfully');
        return parsed.content;
      }
      
      return cleanedContent;
    } catch (e) {
      console.warn('⚠️ Error removing JSON formatting:', e);
      return content;
    }
  }
  
  // If it's already in HTML format, return as is
  return content;
}

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
 * Extract product specifications from DeepSeek response
 */
export function extractProductSpecs(content: string): any[] {
  if (!content) return [];
  
  try {
    // Look for the products array in JSON format
    const productsMatch = content.match(/"products"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
    
    if (productsMatch && productsMatch[1]) {
      // Clean up the matched JSON string
      const productsJson = productsMatch[1]
        .replace(/\/\/.*$/gm, '') // Remove comments
        .replace(/,\s*\]/g, ']'); // Remove trailing commas
      
      // Parse the JSON
      try {
        const products = JSON.parse(productsJson);
        console.log(`✅ Successfully extracted specifications for ${products.length} products`);
        return products;
      } catch (jsonError) {
        console.warn('⚠️ Error parsing products JSON:', jsonError);
        // Try with a more lenient approach - this is a fallback
        const fallbackMatch = productsJson.match(/\[\s*\{[\s\S]*?position[\s\S]*?\}\s*\]/);
        if (fallbackMatch) {
          try {
            const products = JSON.parse(fallbackMatch[0]);
            console.log(`✅ Fallback: Extracted specifications for ${products.length} products`);
            return products;
          } catch (fallbackError) {
            console.warn('⚠️ Fallback extraction also failed:', fallbackError);
            return [];
          }
        }
      }
    }
    
    // If no products array was found, look for individual position entries
    const positionMatches = [...content.matchAll(/"position"\s*:\s*(\d+)[\s\S]*?"cpu"\s*:\s*"([^"]*)"[\s\S]*?"ram"\s*:\s*"([^"]*)"[\s\S]*?"graphics"\s*:\s*"([^"]*)"[\s\S]*?"storage"\s*:\s*"([^"]*)"[\s\S]*?"screen"\s*:\s*"([^"]*)"[\s\S]*?"battery"\s*:\s*"([^"]*)"/g)];
    
    if (positionMatches.length > 0) {
      const products = positionMatches.map(match => ({
        position: parseInt(match[1], 10),
        cpu: match[2],
        ram: match[3],
        graphics: match[4],
        storage: match[5],
        screen: match[6],
        battery: match[7]
      }));
      
      console.log(`✅ Alternative method: Extracted specifications for ${products.length} products`);
      return products;
    }
    
    console.warn('⚠️ No product specifications found in content');
    return [];
  } catch (e) {
    console.error('💥 Error extracting product specifications:', e);
    return [];
  }
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
 * Inject additional images into the content
 */
export function injectAdditionalImages(content: string, images?: string[], category?: string): string {
  if (!content || !images || images.length === 0) return content;
  
  // TODO: Implement image injection logic
  return content;
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

// Export all functions
export {
  removeJsonFormatting,
  cleanupContent,
  fixHtmlTags,
  extractProductSpecs,
  fixTopTenHtmlIfNeeded,
  injectAdditionalImages,
  addImageFallbacks,
  improveContentSpacing
};

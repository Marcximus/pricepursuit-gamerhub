
/**
 * HTML formatting utilities for blog content
 */

/**
 * Ensure proper HTML structure for Top10 posts
 */
export function ensureProperHtmlStructure(content: string): string {
  let processedContent = content;
  
  // Ensure h1 tags are properly formatted
  processedContent = processedContent.replace(/<h1([^>]*)>([^<]*)/g, '<h1$1>$2</h1>');
  
  // Fix paragraph tags - ensure they're properly wrapped
  processedContent = processedContent.replace(/<p>([^<]*?)(?=<(?!\/p>))/g, '<p>$1</p>');
  
  // Ensure other heading tags are properly closed
  processedContent = processedContent.replace(/<h([2-6])([^>]*)>([^<]*)/g, '<h$1$2>$3</h$1>');
  
  // Fix any unclosed list items
  processedContent = processedContent.replace(/<li>([^<]*?)(?=<(?!\/li>))/g, '<li>$1</li>');
  
  // Fix any unclosed ul or ol tags
  processedContent = processedContent.replace(/<(ul|ol)>([^<]*?)<li/g, '<$1><li');
  processedContent = processedContent.replace(/<\/li>([^<]*?)(?=<(?!\/(ul|ol)>))/g, '</li>');
  
  // Ensure proper nesting of lists
  processedContent = processedContent.replace(/<\/(ul|ol)>([^<]*?)<li/g, '</$1><ul><li');
  processedContent = processedContent.replace(/<\/li>([^<]*?)<\/(ul|ol)>/g, '</li></ul>');
  
  return processedContent;
}

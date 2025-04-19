
/**
 * Wrap content in HTML tags and ensure proper formatting
 */
export function wrapContentInHtml(content: string): string {
  if (!content) return '';
  
  // Just add the wrapper class without modifying the inner HTML structure
  return `<div class="how-to-content">${content}</div>`;
}

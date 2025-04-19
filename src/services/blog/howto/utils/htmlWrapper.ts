
/**
 * Wrap content in HTML tags and ensure proper formatting
 */
export function wrapContentInHtml(content: string): string {
  if (!content) return '';
  
  // Add a wrapper class to help with styling
  return `<div class="how-to-content">${content}</div>`;
}


/**
 * Wrap content in HTML tags and ensure proper formatting
 */
export function wrapContentInHtml(content: string): string {
  if (!content) return '';
  
  // Ensure all image placeholders have proper surrounding div if not already present
  let processedContent = content.replace(
    /(<div class="image-placeholder"[^>]*>.*?<\/div>)(?!<\/div>)/gs,
    '<div class="section-image">$1</div>'
  );
  
  // Add the wrapper class to the entire content
  return `<div class="how-to-content">${processedContent}</div>`;
}

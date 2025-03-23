
/**
 * Utilities for cleaning up AI-generated content
 */

/**
 * Clean up AI-generated content by removing metadata and formatting
 */
export function cleanupContent(content: string): string {
  console.log(`🧹 Cleaning up content...`);
  
  // Remove any JSON format markers from the content
  let cleaned = content.replace(/```json|```/g, '');
  
  // Remove title, excerpt, and tags from the content
  cleaned = cleaned.replace(/^#\s*(.*?)$|^Title:\s*(.*?)$/im, '');
  cleaned = cleaned.replace(/^Excerpt:\s*([\s\S]*?)(?=\n\n)/im, '');
  cleaned = cleaned.replace(/^Tags:\s*(.*?)$/im, '');
  
  // Remove Markdown-formatted excerpt and tags
  cleaned = cleaned.replace(/\*\*Excerpt:\*\*([\s\S]*?)(?=\n\n)/, '');
  cleaned = cleaned.replace(/\*\*Tags:\*\*([\s\S]*?)$/, '');
  
  // Standardize headers
  cleaned = cleaned.replace(/^Title:/gim, '##');
  cleaned = cleaned.replace(/^Subtitle:/gim, '###');
  
  // Ensure proper spacing
  cleaned = cleaned.trim().replace(/\n{3,}/g, '\n\n');
  
  console.log(`✅ Content cleaned up successfully`);
  return cleaned;
}

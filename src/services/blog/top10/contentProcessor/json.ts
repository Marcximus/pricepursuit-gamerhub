
/**
 * JSON-related content processing utilities for Top10 blog posts
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

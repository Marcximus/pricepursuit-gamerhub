
/**
 * Specialized module for extracting JSON from different formats
 */
import { GeneratedBlogContent } from '../../types';

/**
 * Extract and parse JSON from response content
 */
export function parseJsonResponse(content: string, existingData?: GeneratedBlogContent): GeneratedBlogContent {
  // Check if the response contains JSON within the content (common issue with How-To blogs)
  if (content.includes('"title":') && content.includes('"content":')) {
    console.log('🔍 Detected JSON structure within response data, attempting to extract...');
    try {
      // Extract JSON object from content
      const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
      if (jsonMatch) {
        const jsonContent = jsonMatch[0];
        console.log('🔍 Extracted potential JSON:', jsonContent.substring(0, 100) + '...');
        
        // Clean up HTML tags like <br/> that might be embedded in the JSON
        const cleanedJson = jsonContent
          .replace(/<br\/>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/<[^>]*>/g, '');
          
        const parsedData = JSON.parse(cleanedJson);
        console.log('✅ Successfully parsed extracted JSON');
        
        // If we have existing data and parsed new content, merge them
        if (existingData) {
          return {
            ...existingData,
            content: parsedData.content || existingData.content,
            title: parsedData.title || existingData.title,
            excerpt: parsedData.excerpt || existingData.excerpt,
            tags: parsedData.tags || existingData.tags || []
          };
        }
        
        return parsedData;
      }
    } catch (error) {
      console.error('💥 Error in parseJsonResponse:', error);
    }
  }
  
  // If we got here, try one more approach - if we can see it's a How-To blog with clear JSON structure
  if (content.includes('"title":') && content.includes('"content":') && 
      content.includes('"excerpt":') && content.includes('"tags":')) {
    try {
      // Try to manually create a valid JSON by extracting key components
      console.log('🔍 Attempting manual extraction of JSON components...');
      
      // Extract title
      const titleMatch = content.match(/"title"\s*:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : 'New How-To Post';
      
      // Extract content - more complex since it may contain nested quotes
      let contentMatch = content.match(/"content"\s*:\s*"([\s\S]*?)(?=",\s*"excerpt"|",\s*"tags"|"})/);
      let extractedContent = '';
      if (contentMatch) {
        extractedContent = contentMatch[1]
          .replace(/\\"/g, '"')  // Replace escaped quotes
          .replace(/\\\\/g, '\\'); // Replace escaped backslashes
      }
      
      // Extract excerpt
      const excerptMatch = content.match(/"excerpt"\s*:\s*"([^"]+)"/);
      const excerpt = excerptMatch ? excerptMatch[1] : '';
      
      // Extract tags
      const tagsMatch = content.match(/"tags"\s*:\s*\[([\s\S]*?)\]/);
      const tags = tagsMatch ? 
        tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) : 
        ['how-to', 'tutorial', 'guide'];
      
      return {
        title,
        content: extractedContent,
        excerpt,
        tags,
        category: 'How-To'
      };
    } catch (manualError) {
      console.error('❌ Manual extraction failed:', manualError);
      throw new Error('Failed to parse AI response: ' + manualError.message);
    }
  }
  
  throw new Error('Could not extract valid JSON from response');
}


/**
 * Main parser module that orchestrates the parsing process
 */
import { GeneratedBlogContent } from '../../types';
import { cleanTitle } from './titleCleaner';
import { processContent } from './contentProcessor';
import { cleanExcerpt } from './excerptCleaner';
import { parseJsonResponse } from './jsonParser';

/**
 * Parse response data from the edge function
 */
export function parseGenerationResponse(response: any): GeneratedBlogContent {
  // Check if response.data exists and is valid
  if (!response || !response.data) {
    console.error('❌ Empty response data from edge function');
    throw new Error('Empty response from edge function');
  }

  console.log('✅ Blog post generated successfully');
  console.log('🔄 Processing generated content...');
  console.log('📦 Response data type:', typeof response.data);
  
  let data: GeneratedBlogContent;
  
  // Handle parsing for both string and object response formats
  if (typeof response.data === 'string') {
    try {
      // Try to parse as JSON if it's a string
      console.log('🔍 Trying to parse string response as JSON');
      console.log('🔍 Response string preview:', response.data.substring(0, 100) + '...');
      data = JSON.parse(response.data);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('📄 Raw response data preview:', 
        response.data.substring(0, Math.min(200, response.data.length)) + '...');
      
      // Try to extract JSON using the jsonParser module
      try {
        data = parseJsonResponse(response.data);
      } catch (nestedError) {
        console.error('❌ Failed to extract JSON from content:', nestedError);
        throw new Error('Failed to parse AI response: ' + parseError.message);
      }
    }
  } else {
    // If it's already an object, use it directly
    console.log('🔍 Response is already an object, using directly');
    data = response.data as GeneratedBlogContent;
    
    // If the content field itself contains a JSON string (common in How-To posts)
    if (typeof data.content === 'string' && 
        (data.content.startsWith('{') || data.content.includes('"title":'))) {
      try {
        console.log('🔍 Content appears to be a JSON string, attempting to parse content field');
        data = parseJsonResponse(data.content, data);
      } catch (contentParseError) {
        console.warn('⚠️ Could not parse content as JSON, using as-is:', contentParseError);
      }
    }
  }
  
  // Clean title from any JSON or HTML formatting
  if (data.title) {
    data.title = cleanTitle(data.title);
  }
  
  // Process content
  if (data.content) {
    data.content = processContent(data.content);
  }
  
  // Clean and format excerpt
  if (data.excerpt) {
    data.excerpt = cleanExcerpt(data.excerpt);
  }
  
  // Validate final content
  if (!data.content || data.content.length === 0) {
    console.error('❌ CRITICAL ERROR: Content is empty after API call');
    console.error('❌ Response data structure:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    // Fail with a clear error instead of using fallback content
    throw new Error('API returned empty content');
  }
  
  // Add a short preview of the content for debugging
  if (data && data.content) {
    console.log('📄 Content first 100 chars:', 
      `"${data.content.substring(0, Math.min(100, data.content.length))}${data.content.length > 100 ? '...' : ''}"`);
    console.log('📄 Content has video:', data.content.includes('humix'));
    console.log('📄 Product card count:', 
      (data.content.match(/product-card/g) || []).length);
  }
  
  return data;
}

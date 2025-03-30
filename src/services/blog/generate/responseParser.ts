
/**
 * Parses the API response from the blog generation service
 */
import { GeneratedBlogContent } from '../types';

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
      
      // Fail explicitly rather than using fallback content
      throw new Error('Failed to parse AI response: ' + parseError.message);
    }
  } else {
    // If it's already an object, use it directly
    console.log('🔍 Response is already an object, using directly');
    data = response.data as GeneratedBlogContent;
  }
  
  // Log the content length for debugging
  console.log('📄 Final content length:', data?.content?.length || 0, 'characters');
  
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

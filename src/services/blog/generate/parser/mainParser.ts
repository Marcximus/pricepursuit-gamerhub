
/**
 * Main parser for blog generation responses
 */
import { GeneratedBlogContent } from '../../types';
import { parseJsonResponse } from './jsonParser';
import { cleanTitle } from './titleCleaner';
import { processContent } from './contentProcessor';
import { cleanExcerpt } from './excerptCleaner';

/**
 * Parse the response from the blog generation API
 */
export function parseGenerationResponse(response: any): GeneratedBlogContent {
  try {
    console.log('🔍 Parsing generation response...');
    
    // First extract any valid data from the response
    let data: any = null;
    
    // Handle different response formats
    if (typeof response === 'string') {
      data = parseJsonResponse(response);
    } else if (response?.data && typeof response.data === 'string') {
      data = parseJsonResponse(response.data);
    } else if (response?.data) {
      data = response.data;
    } else {
      data = response;
    }
    
    // Log what we found for debugging
    console.log('📦 Parsed data structure:', Object.keys(data || {}));
    
    // Extract and clean the components
    const title = data?.title ? cleanTitle(data.title) : 'New Blog Post';
    const content = data?.content ? processContent(data.content) : '';
    const excerpt = data?.excerpt ? cleanExcerpt(data.excerpt) : '';
    const tags = Array.isArray(data?.tags) ? data.tags : [];
    
    // Return the cleaned and structured blog content
    return {
      title,
      content,
      excerpt,
      tags
    };
  } catch (error) {
    console.error('💥 Error parsing generation response:', error);
    
    // Attempt a more forgiving parsing approach for content recovery
    const recoveredData = attemptContentRecovery(response);
    
    return {
      title: recoveredData.title || 'New Blog Post',
      content: recoveredData.content || '<p>Content generation failed. Please try again.</p>',
      excerpt: recoveredData.excerpt || '',
      tags: recoveredData.tags || []
    };
  }
}

/**
 * Attempt to recover content from a failed parse
 */
function attemptContentRecovery(response: any): Partial<GeneratedBlogContent> {
  console.log('🔄 Attempting content recovery from failed parse');
  
  try {
    const responseText = typeof response === 'string' 
      ? response 
      : typeof response?.data === 'string' 
        ? response.data 
        : JSON.stringify(response);
    
    // Try to extract title from the content
    const titleMatch = responseText.match(/"title"\s*:\s*"([^"]+)"/);
    const title = titleMatch ? cleanTitle(titleMatch[1]) : 'Recovered Blog Post';
    
    // Try to extract content
    let content = '';
    const contentMatch = responseText.match(/"content"\s*:\s*"(.+?)(?="excerpt"|"tags"|}\s*$)/s);
    if (contentMatch) {
      content = contentMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
      content = processContent(content);
    } else if (responseText.includes('<h1>') || responseText.includes('<p>')) {
      // If we can find HTML directly in the response, use that
      content = processContent(responseText);
    }
    
    // Try to extract excerpt
    const excerptMatch = responseText.match(/"excerpt"\s*:\s*"([^"]+)"/);
    const excerpt = excerptMatch ? cleanExcerpt(excerptMatch[1]) : '';
    
    // Try to extract tags
    const tagsMatches = responseText.match(/"tags"\s*:\s*\[(.*?)\]/);
    let tags: string[] = [];
    if (tagsMatches) {
      const tagsText = tagsMatches[1];
      tags = tagsText.split(',')
        .map(tag => tag.trim().replace(/"/g, ''))
        .filter(tag => tag.length > 0);
    }
    
    return { title, content, excerpt, tags };
  } catch (recoveryError) {
    console.error('💥 Recovery attempt failed:', recoveryError);
    return {};
  }
}

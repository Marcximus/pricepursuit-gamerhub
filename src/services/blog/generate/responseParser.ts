
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
      
      // Check if the response contains JSON within the content (common issue with How-To blogs)
      if (response.data.includes('"title":') && response.data.includes('"content":')) {
        console.log('🔍 Detected JSON structure within response data, attempting to extract...');
        try {
          // Extract JSON object from content
          const jsonMatch = response.data.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
          if (jsonMatch) {
            const jsonContent = jsonMatch[0];
            console.log('🔍 Extracted potential JSON:', jsonContent.substring(0, 100) + '...');
            data = JSON.parse(jsonContent);
            console.log('✅ Successfully parsed extracted JSON');
          } else {
            throw new Error('Could not extract valid JSON from response');
          }
        } catch (nestedError) {
          console.error('❌ Failed to extract JSON from content:', nestedError);
          // Fail explicitly rather than using fallback content
          throw new Error('Failed to parse AI response: ' + parseError.message);
        }
      } else {
        // Fail explicitly rather than using fallback content
        throw new Error('Failed to parse AI response: ' + parseError.message);
      }
    }
  } else {
    // If it's already an object, use it directly
    console.log('🔍 Response is already an object, using directly');
    data = response.data as GeneratedBlogContent;
  }
  
  // Process content for How-To blogs to ensure proper HTML rendering
  if (data.content) {
    // Remove any escaped newlines and replace with proper HTML
    data.content = data.content
      .replace(/\\n\\n/g, '\n\n')
      .replace(/\\n/g, '\n')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n([^<])/g, '<br/>$1');
    
    // Ensure proper HTML structure with tags
    if (!data.content.includes('<h1>') && !data.content.includes('<h2>')) {
      // If no heading tags, wrap content in proper HTML structure
      const lines = data.content.split(/\n\n|\r\n\r\n/);
      if (lines.length > 1) {
        const title = lines[0];
        const rest = lines.slice(1).join('\n\n');
        data.content = `<h1>${title}</h1><p>${rest}</p>`;
      }
    }
    
    // Fix table formatting issues - common in How-To blogs
    if (data.content.includes('Term') && data.content.includes('What It Means')) {
      console.log('🔍 Detected table structure, fixing formatting...');
      // Extract table data
      const tableMatch = data.content.match(/Term([\s\S]*?)(?=<\/p>|<h2>|$)/);
      if (tableMatch) {
        const tableText = tableMatch[0];
        // Create proper HTML table
        const rows = tableText.split('\n').filter(line => line.trim().length > 0);
        let htmlTable = '<table class="w-full border-collapse border border-gray-300 my-4"><thead><tr>';
        
        // Process header row
        const headers = rows[0].split('\t').map(h => h.trim());
        headers.forEach(header => {
          htmlTable += `<th class="border border-gray-300 px-4 py-2">${header}</th>`;
        });
        htmlTable += '</tr></thead><tbody>';
        
        // Process data rows
        for (let i = 1; i < rows.length; i++) {
          const cells = rows[i].split('\t').map(c => c.trim());
          htmlTable += '<tr>';
          cells.forEach(cell => {
            htmlTable += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`;
          });
          htmlTable += '</tr>';
        }
        htmlTable += '</tbody></table>';
        
        // Replace the text table with HTML table
        data.content = data.content.replace(tableText, htmlTable);
      }
    }
    
    // Fix image placeholders for How-To blogs
    data.content = data.content
      .replace(/Image (\d+)/g, '<div class="image-placeholder"></div>')
      .replace(/\[Image (\d+)\]/g, '<div class="image-placeholder"></div>');
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

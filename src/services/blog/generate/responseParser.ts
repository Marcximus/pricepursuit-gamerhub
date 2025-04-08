
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
            
            // Clean up HTML tags like <br/> that might be embedded in the JSON
            const cleanedJson = jsonContent
              .replace(/<br\/>/g, '')
              .replace(/&quot;/g, '"')
              .replace(/<[^>]*>/g, '');
              
            data = JSON.parse(cleanedJson);
            console.log('✅ Successfully parsed extracted JSON');
          } else {
            throw new Error('Could not extract valid JSON from response');
          }
        } catch (nestedError) {
          console.error('❌ Failed to extract JSON from content:', nestedError);
          // Try one more approach - if we can see it's a How-To blog with clear JSON structure
          if (response.data.includes('"title":') && response.data.includes('"content":') && 
              response.data.includes('"excerpt":') && response.data.includes('"tags":')) {
            try {
              // Try to manually create a valid JSON by extracting key components
              console.log('🔍 Attempting manual extraction of JSON components...');
              
              // Extract title
              const titleMatch = response.data.match(/"title"\s*:\s*"([^"]+)"/);
              const title = titleMatch ? titleMatch[1] : 'New How-To Post';
              
              // Extract content - more complex since it may contain nested quotes
              let contentMatch = response.data.match(/"content"\s*:\s*"([\s\S]*?)(?=",\s*"excerpt"|",\s*"tags"|"})/);
              let content = '';
              if (contentMatch) {
                content = contentMatch[1]
                  .replace(/\\"/g, '"')  // Replace escaped quotes
                  .replace(/\\\\/g, '\\'); // Replace escaped backslashes
              }
              
              // Extract excerpt
              const excerptMatch = response.data.match(/"excerpt"\s*:\s*"([^"]+)"/);
              const excerpt = excerptMatch ? excerptMatch[1] : '';
              
              // Extract tags
              const tagsMatch = response.data.match(/"tags"\s*:\s*\[([\s\S]*?)\]/);
              const tags = tagsMatch ? 
                tagsMatch[1].split(',').map(tag => tag.trim().replace(/"/g, '')) : 
                ['how-to', 'tutorial', 'guide'];
              
              data = {
                title,
                content,
                excerpt,
                tags,
                category: 'How-To'
              };
              
              console.log('✅ Successfully extracted content through manual parsing');
            } catch (manualError) {
              console.error('❌ Manual extraction failed:', manualError);
              throw new Error('Failed to parse AI response: ' + parseError.message);
            }
          } else {
            // Fail explicitly rather than using fallback content
            throw new Error('Failed to parse AI response: ' + parseError.message);
          }
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
    
    // If the content field itself contains a JSON string (common in How-To posts)
    if (typeof data.content === 'string' && 
        (data.content.startsWith('{') || data.content.includes('"title":'))) {
      try {
        console.log('🔍 Content appears to be a JSON string, attempting to parse content field');
        // Check if we need to clean HTML tags first
        let contentToProcess = data.content;
        if (contentToProcess.includes('<br/>') || contentToProcess.includes('&quot;')) {
          contentToProcess = contentToProcess
            .replace(/<br\/>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/<[^>]*>/g, '');
        }
        
        const parsedContent = JSON.parse(contentToProcess);
        
        // If the parsed content has the structure we expect, use it
        if (parsedContent.content) {
          console.log('✅ Successfully parsed nested JSON content');
          // Update the data object with the parsed fields
          data.content = parsedContent.content;
          // Only update these if the original didn't have them
          if (!data.title && parsedContent.title) data.title = parsedContent.title;
          if (!data.excerpt && parsedContent.excerpt) data.excerpt = parsedContent.excerpt;
          if ((!data.tags || data.tags.length === 0) && parsedContent.tags) data.tags = parsedContent.tags;
        }
      } catch (contentParseError) {
        console.warn('⚠️ Could not parse content as JSON, using as-is:', contentParseError);
      }
    }
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
  
  // NEW: Ensure excerpt is properly formatted and not cut off
  if (data.excerpt) {
    // Clean up any HTML or special characters in excerpt
    data.excerpt = data.excerpt
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/<[^>]*>/g, '')
      .trim();
    
    // If excerpt ends abruptly, add ellipsis
    if (data.excerpt.endsWith(',') || 
        data.excerpt.endsWith('-') || 
        data.excerpt.endsWith('–')) {
      data.excerpt = data.excerpt.slice(0, -1) + '...';
    }
    
    // Ensure excerpt doesn't exceed 200 characters (as specified in the prompt)
    if (data.excerpt.length > 200) {
      data.excerpt = data.excerpt.substring(0, 197) + '...';
    }
    
    // Ensure excerpt has proper ending punctuation
    if (!data.excerpt.endsWith('.') && 
        !data.excerpt.endsWith('!') && 
        !data.excerpt.endsWith('?') && 
        !data.excerpt.endsWith('...')) {
      data.excerpt += '.';
    }
  }
  
  // Log the content length for debugging
  console.log('📄 Final content length:', data?.content?.length || 0, 'characters');
  console.log('📄 Final excerpt length:', data?.excerpt?.length || 0, 'characters');
  console.log('📄 Excerpt sample:', data?.excerpt?.substring(0, 50) + '...');
  
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

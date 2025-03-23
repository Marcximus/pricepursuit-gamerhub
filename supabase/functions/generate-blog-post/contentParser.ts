
/**
 * This file handles parsing AI-generated content into structured blog post data
 */

export function parseGeneratedContent(content: string, category: string) {
  console.log(`🔍 Parsing content for ${category} post type...`);
  console.log(`🔍 Raw content length: ${content ? content.length : 0} characters`);
  console.log(`🔍 Content starts with: "${content ? content.substring(0, 50) : 'EMPTY'}"...`);
  
  if (!content || content.trim().length === 0) {
    console.error('❌ CRITICAL ERROR: Received empty content from AI service');
    console.error('❌ Cannot parse empty content, returning error structure');
    return {
      title: `Error: Empty ${category} Post`,
      content: `<h1>Error Generating Content</h1><p>Our AI service returned an empty response. Please try again later.</p>`,
      excerpt: "Error: Empty response from AI service",
      category,
      tags: ['error']
    };
  }
  
  try {
    // Default values
    let title = `New ${category} Post`;
    let excerpt = '';
    let tags: string[] = [];
    let processedContent = content;
    
    // For Top10 posts, we'll use the AI-generated HTML directly
    if (category === 'Top10') {
      console.log('📄 Processing Top10 content as direct HTML...');
      
      // Extract title from h1 tags
      const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        console.log(`📝 Extracted title from HTML: "${title}"`);
      } else {
        console.warn(`⚠️ Could not extract title from HTML content`);
        console.log(`⚠️ First 200 chars of content: ${content.substring(0, 200)}`);
      }
      
      // Generate excerpt from the first paragraph
      const excerptMatch = content.match(/<p>(.*?)<\/p>/i);
      if (excerptMatch && excerptMatch[1]) {
        // Strip HTML tags and limit to 160 chars
        excerpt = excerptMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 160);
        console.log(`📋 Generated excerpt from first paragraph: "${excerpt.substring(0, 30)}..."`);
      } else {
        console.warn(`⚠️ Could not extract excerpt from HTML content`);
      }
      
      // Generate default tags based on title and content
      tags = generateTagsFromContent(title, content, category);
      console.log(`🏷️ Generated default tags: ${tags.join(', ')}`);
      
      // Ensure proper HTML structure for Top10 posts
      processedContent = ensureProperHtmlStructure(content);
      console.log(`📄 Final processed content length: ${processedContent.length} characters`);
      console.log(`📄 Content has paragraphs: ${processedContent.includes('<p>')}`);
      console.log(`📄 Content has headings: ${processedContent.includes('<h')}`);
    } else {
      // For other post types, handle as before
      // Handle potential JSON responses from the AI
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        try {
          console.log('📄 Content appears to be JSON, attempting to parse it');
          const jsonContent = JSON.parse(content);
          
          // If the parsed content has all the fields we need, use it directly
          if (jsonContent.title && jsonContent.content) {
            console.log('✅ Successfully parsed JSON content');
            console.log(`📄 JSON content title: "${jsonContent.title}"`);
            console.log(`📄 JSON content length: ${jsonContent.content.length} characters`);
            return {
              title: jsonContent.title,
              content: jsonContent.content,
              excerpt: jsonContent.excerpt || '',
              category,
              tags: jsonContent.tags || []
            };
          }
        } catch (jsonError) {
          console.log('⚠️ Failed to parse content as JSON, falling back to regex extraction');
          console.error('⚠️ JSON parse error:', jsonError.message);
          // Continue with regex parsing if JSON parsing fails
        }
      }
      
      // Define regex patterns to extract components
      const titleRegex = /^#\s*(.*?)$|^Title:\s*(.*?)$|^"title":\s*"(.*?)"/im;
      const excerptRegex = /^Excerpt:\s*([\s\S]*?)(?=\n\n)|^"excerpt":\s*"([\s\S]*?)"/im;
      const tagsRegex = /^Tags:\s*(.*?)$|^"tags":\s*\[(.*?)\]/im;
      
      // Extract title
      const titleMatch = content.match(titleRegex);
      if (titleMatch) {
        title = (titleMatch[1] || titleMatch[2] || titleMatch[3] || '').trim();
        console.log(`📝 Extracted title: "${title}"`);
      } else {
        console.log(`⚠️ No title found, using fallback`);
      }
      
      // Extract excerpt
      const excerptMatch = content.match(excerptRegex);
      if (excerptMatch) {
        excerpt = (excerptMatch[1] || excerptMatch[2] || '').trim();
        console.log(`📋 Extracted excerpt: "${excerpt.substring(0, 30)}..."`);
      } else {
        console.log(`⚠️ No excerpt found, generating from content`);
        // If no excerpt found, use the first paragraph of content as excerpt
        const firstParagraph = content.split('\n\n')[1] || content.split('\n\n')[0] || '';
        excerpt = firstParagraph.replace(/^#.*$/gm, '').trim().substring(0, 160);
      }
      
      // Extract tags
      const tagsMatch = content.match(tagsRegex);
      if (tagsMatch) {
        const tagsString = (tagsMatch[1] || tagsMatch[2] || '').trim();
        if (tagsString.includes('"') || tagsString.includes("'")) {
          // Handle JSON format tags
          console.log(`🏷️ Detected JSON-formatted tags`);
          try {
            tags = JSON.parse(`[${tagsString}]`);
          } catch (e) {
            try {
              // Try to fix common issues with JSON tags format
              const fixedString = tagsString
                .replace(/'/g, '"')  // Replace single quotes with double quotes
                .replace(/,\s*$/, ''); // Remove trailing commas
              tags = JSON.parse(`[${fixedString}]`);
            } catch (e2) {
              // If still failing, fallback to simple splitting
              tags = tagsString.split(/,\s*/);
            }
          }
        } else {
          tags = tagsString.split(/,\s*/);
        }
        console.log(`🏷️ Extracted ${tags.length} tags: ${tags.join(', ')}`);
      } else {
        console.log(`⚠️ No tags found, generating default tags`);
        tags = generateTagsFromContent(title, content, category);
      }
      
      // Process main content - clean up any markdown or metadata
      processedContent = cleanupContent(content);
      console.log(`📄 Content after cleanup: ${processedContent.length} characters`);
    }
    
    console.log(`✅ Content processing complete`);
    console.log(`📊 Final content length: ${processedContent.length} characters`);
    
    if (processedContent.length === 0) {
      console.error('❌ CRITICAL: Processed content is EMPTY after parsing!');
      console.error('❌ Original content length was:', content.length);
      // Return error content instead of empty content
      return {
        title: title || `Error in ${category} Post`,
        content: `<h1>${title || 'Error Processing Content'}</h1><p>We encountered an error while processing the content. Please try again later.</p>`,
        excerpt: excerpt || "Error processing content",
        category,
        tags
      };
    }
    
    return {
      title,
      content: processedContent,
      excerpt,
      category,
      tags
    };
  } catch (error) {
    console.error(`💥 Error parsing content:`, error);
    console.error(`💥 Original content preview: "${content ? content.substring(0, 200) : 'EMPTY'}..."`);
    // Return a basic structure with error information
    return {
      title: `Error in ${category} Post`,
      content: `<h1>Error Processing Content</h1><p>We encountered an error: ${error.message}</p><p>Please try again later.</p>`,
      excerpt: "There was an error generating this post's content.",
      category,
      tags: ['error']
    };
  }
}

/**
 * Ensure proper HTML structure for Top10 posts
 */
function ensureProperHtmlStructure(content: string): string {
  let processedContent = content;
  
  // Ensure h1 tags are properly formatted
  processedContent = processedContent.replace(/<h1([^>]*)>([^<]*)/g, '<h1$1>$2</h1>');
  
  // Fix paragraph tags - ensure they're properly wrapped
  processedContent = processedContent.replace(/<p>([^<]*?)(?=<(?!\/p>))/g, '<p>$1</p>');
  
  // Ensure other heading tags are properly closed
  processedContent = processedContent.replace(/<h([2-6])([^>]*)>([^<]*)/g, '<h$1$2>$3</h$1>');
  
  // Fix any unclosed list items
  processedContent = processedContent.replace(/<li>([^<]*?)(?=<(?!\/li>))/g, '<li>$1</li>');
  
  // Fix any unclosed ul or ol tags
  processedContent = processedContent.replace(/<(ul|ol)>([^<]*?)<li/g, '<$1><li');
  processedContent = processedContent.replace(/<\/li>([^<]*?)(?=<(?!\/(ul|ol)>))/g, '</li>');
  
  // Ensure proper nesting of lists
  processedContent = processedContent.replace(/<\/(ul|ol)>([^<]*?)<li/g, '</$1><ul><li');
  processedContent = processedContent.replace(/<\/li>([^<]*?)<\/(ul|ol)>/g, '</li></ul>');
  
  return processedContent;
}

/**
 * Clean up AI-generated content
 */
function cleanupContent(content: string): string {
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

/**
 * Generate tags from content for SEO purposes
 */
function generateTagsFromContent(title: string, content: string, category: string): string[] {
  const defaultTags: Record<string, string[]> = {
    'Review': ['review', 'laptop', 'tech'],
    'Comparison': ['comparison', 'versus', 'laptops'],
    'Top10': ['best laptops', 'top 10', 'recommendations'],
    'How-To': ['how-to', 'tutorial', 'guide']
  };
  
  // Start with category-specific default tags
  const tags = [...defaultTags[category] || ['tech', 'laptops']];
  
  // Extract potential keywords from title
  const titleWords = title.toLowerCase().split(/\s+/);
  const brandKeywords = ['lenovo', 'hp', 'dell', 'asus', 'acer', 'microsoft', 'apple', 'msi', 'alienware', 'razer'];
  const typeKeywords = ['gaming', 'business', 'student', 'budget', 'premium', 'ultrabook', 'convertible', 'detachable'];
  
  // Add brand if found in title
  for (const brand of brandKeywords) {
    if (titleWords.includes(brand)) {
      tags.push(brand);
      tags.push(`${brand} laptop`);
      break;
    }
  }
  
  // Add laptop type if found in title
  for (const type of typeKeywords) {
    if (titleWords.includes(type)) {
      tags.push(type);
      tags.push(`${type} laptop`);
      break;
    }
  }
  
  // Limit to 10 unique tags
  return [...new Set(tags)].slice(0, 10);
}


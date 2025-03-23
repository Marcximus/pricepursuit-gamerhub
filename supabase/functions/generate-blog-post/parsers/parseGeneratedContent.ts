
/**
 * Main content parser that coordinates parsing the AI-generated content
 */
import { extractContentComponents } from "./extractors.ts";
import { cleanupContent } from "./cleanupUtils.ts";
import { generateTagsFromContent } from "./tagGenerator.ts";
import { ensureProperHtmlStructure } from "./htmlFormatter.ts";

export function parseGeneratedContent(content: string, category: string) {
  console.log(`🔍 Parsing content for ${category} post type...`);
  
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
      }
      
      // Generate excerpt from the first paragraph
      const excerptMatch = content.match(/<p>(.*?)<\/p>/i);
      if (excerptMatch && excerptMatch[1]) {
        // Strip HTML tags and limit to 160 chars
        excerpt = excerptMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 160);
        console.log(`📋 Generated excerpt from first paragraph: "${excerpt.substring(0, 30)}..."`);
      }
      
      // Generate default tags based on title and content
      tags = generateTagsFromContent(title, content, category);
      console.log(`🏷️ Generated default tags: ${tags.join(', ')}`);
      
      // Ensure proper HTML structure for Top10 posts
      processedContent = ensureProperHtmlStructure(content);
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
          // Continue with regex parsing if JSON parsing fails
        }
      }
      
      // Extract components using regex
      const { extractedTitle, extractedExcerpt, extractedTags } = extractContentComponents(content);
      
      // Use extracted values or defaults
      if (extractedTitle) {
        title = extractedTitle;
        console.log(`📝 Extracted title: "${title}"`);
      } else {
        console.log(`⚠️ No title found, using fallback`);
      }
      
      if (extractedExcerpt) {
        excerpt = extractedExcerpt;
        console.log(`📋 Extracted excerpt: "${excerpt.substring(0, 30)}..."`);
      } else {
        console.log(`⚠️ No excerpt found, generating from content`);
        // If no excerpt found, use the first paragraph of content as excerpt
        const firstParagraph = content.split('\n\n')[1] || content.split('\n\n')[0] || '';
        excerpt = firstParagraph.replace(/^#.*$/gm, '').trim().substring(0, 160);
      }
      
      if (extractedTags && extractedTags.length > 0) {
        tags = extractedTags;
        console.log(`🏷️ Extracted ${tags.length} tags: ${tags.join(', ')}`);
      } else {
        console.log(`⚠️ No tags found, generating default tags`);
        tags = generateTagsFromContent(title, content, category);
      }
      
      // Process main content - clean up any markdown or metadata
      processedContent = cleanupContent(content);
    }
    
    console.log(`✅ Content processing complete`);
    console.log(`📊 Content length: ${processedContent.length} characters`);
    
    return {
      title,
      content: processedContent,
      excerpt,
      category,
      tags
    };
  } catch (error) {
    console.error(`💥 Error parsing content:`, error);
    // Return a basic structure with error information
    return {
      title: `New ${category} Post`,
      content: `Error parsing AI content: ${error.message}\n\nOriginal content:\n${content}`,
      excerpt: "There was an error generating this post's content.",
      category,
      tags: ['error']
    };
  }
}

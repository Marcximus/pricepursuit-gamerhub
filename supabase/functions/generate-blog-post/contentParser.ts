
/**
 * This file handles parsing AI-generated content into structured blog post data
 */

export function parseGeneratedContent(content: string, category: string) {
  console.log(`🔍 Parsing content for ${category} post type...`);
  
  try {
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
    
    // Define regex patterns to extract components
    const titleRegex = /^#\s*(.*?)$|^Title:\s*(.*?)$|^"title":\s*"(.*?)"/im;
    const excerptRegex = /^Excerpt:\s*([\s\S]*?)(?=\n\n)|^"excerpt":\s*"([\s\S]*?)"/im;
    const tagsRegex = /^Tags:\s*(.*?)$|^"tags":\s*\[(.*?)\]/im;
    
    // Extract title
    const titleMatch = content.match(titleRegex);
    let title = '';
    if (titleMatch) {
      title = (titleMatch[1] || titleMatch[2] || titleMatch[3] || '').trim();
      console.log(`📝 Extracted title: "${title}"`);
    } else {
      console.log(`⚠️ No title found, using fallback`);
      title = `New ${category} Post`;
    }
    
    // Extract excerpt
    const excerptMatch = content.match(excerptRegex);
    let excerpt = '';
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
    let tags: string[] = [];
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
      console.log(`⚠️ No tags found`);
      // Generate some default tags based on category
      if (category === 'Review') {
        tags = ['review', 'laptop', 'tech'];
      } else if (category === 'Comparison') {
        tags = ['comparison', 'versus', 'laptops'];
      } else if (category === 'Top10') {
        tags = ['best laptops', 'top 10', 'recommendations'];
      } else if (category === 'How-To') {
        tags = ['how-to', 'tutorial', 'guide'];
      }
      console.log(`⚙️ Generated default tags for ${category}: ${tags.join(', ')}`);
    }
    
    // Process main content
    console.log(`📄 Processing main content...`);
    let processedContent = '';
    
    if (category === 'Top10') {
      console.log(`🔢 Formatting Top10 content with product placeholders`);
      // Special handling for Top10 posts to include product data placeholders
      processedContent = formatTop10Content(content);
      
      // Remove excerpt and tags from the content itself since they'll be stored separately
      processedContent = processedContent.replace(/\*\*Excerpt:\*\*([\s\S]*?)(?=\n\n)/, '');
      processedContent = processedContent.replace(/\*\*Tags:\*\*([\s\S]*?)$/, '');
    } else {
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
 * Format Top10 content with placeholders for product data
 */
function formatTop10Content(content: string): string {
  console.log(`🔢 Formatting Top10 content...`);
  
  // Clean the content first but preserve product sections
  let cleaned = cleanupContent(content);
  
  // Look for numbered sections that likely represent product entries
  // We'll use a less aggressive regex to avoid issues
  const productSectionRegex = /#{1,3}\s*(\d+)[.:]?\s*(.*?)(?=\n{2,}|\n#{1,3}|$)/gs;
  const productSections = [];
  
  console.log(`🔍 Searching for product sections in Top10 content...`);
  
  // First pass: collect all product sections without modifying the text
  let match;
  while ((match = productSectionRegex.exec(cleaned)) !== null) {
    const number = parseInt(match[1], 10);
    const title = match[2].trim();
    const fullMatch = match[0];
    const startPosition = match.index;
    const endPosition = startPosition + fullMatch.length;
    
    console.log(`🔹 Found product section #${number}: "${title}"`);
    
    // Check if this is a valid product position (1-10)
    if (number >= 1 && number <= 10) {
      productSections.push({
        number,
        title,
        fullMatch,
        startPosition,
        endPosition
      });
    }
  }
  
  console.log(`✅ Found ${productSections.length} product sections in the content`);
  
  // Sort product sections by their position in the text (maintaining original order)
  productSections.sort((a, b) => a.startPosition - b.startPosition);
  
  // Second pass: replace each product section with the product data placeholder
  // We'll make a copy of the cleaned content and work with offsets
  let finalContent = cleaned;
  let offset = 0;
  
  // Process each section separately
  for (const section of productSections) {
    const placeholder = `<div class="product-data" data-product-id="${section.number}">[PRODUCT_DATA_${section.number}]</div>\n\n`;
    const adjustedStartPosition = section.startPosition + offset;
    
    // Instead of keeping the full content, we'll insert after the heading
    const headingEndIndex = finalContent.indexOf('\n', adjustedStartPosition);
    const insertPosition = headingEndIndex !== -1 ? headingEndIndex + 1 : adjustedStartPosition + section.fullMatch.length;
    
    // Insert the placeholder after the heading
    finalContent = 
      finalContent.substring(0, insertPosition) + 
      '\n' + placeholder + 
      finalContent.substring(insertPosition);
    
    // Update offset for subsequent replacements
    offset += placeholder.length + 1; // +1 for the extra newline
    
    console.log(`🔄 Added placeholder for product section #${section.number}`);
  }
  
  console.log(`✅ Top10 content formatting complete`);
  return finalContent;
}

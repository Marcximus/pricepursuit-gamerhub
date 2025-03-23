
/**
 * Utilities for formatting and ensuring proper HTML structure
 */

/**
 * Ensures the HTML content has properly closed tags and structure
 */
export function ensureProperHtmlStructure(content: string): string {
  try {
    console.log(`🔍 Checking HTML structure...`);
    
    // Handle common HTML issues
    let processedContent = content;
    
    // Ensure tags are properly closed
    const unclosedTags = [
      { open: /<p>/g, close: '</p>' },
      { open: /<h1>/g, close: '</h1>' },
      { open: /<h2>/g, close: '</h2>' },
      { open: /<h3>/g, close: '</h3>' },
      { open: /<ul>/g, close: '</ul>' },
      { open: /<ol>/g, close: '</ol>' },
      { open: /<li>/g, close: '</li>' },
      { open: /<div[^>]*>/g, close: '</div>' }
    ];
    
    // Count open and close tags
    for (const tag of unclosedTags) {
      const openMatches = processedContent.match(tag.open) || [];
      const closeMatches = processedContent.match(new RegExp(tag.close, 'g')) || [];
      
      const openCount = openMatches.length;
      const closeCount = closeMatches.length;
      
      // If we have more open tags than close tags, add the missing close tags
      if (openCount > closeCount) {
        console.log(`⚠️ Found ${openCount - closeCount} unclosed ${tag.close} tags, fixing...`);
        for (let i = 0; i < openCount - closeCount; i++) {
          processedContent += `\n${tag.close}`;
        }
      }
    }
    
    // Fix specific Top10 post issues - ensure placeholder structure
    if (processedContent.includes('Top 10') || processedContent.includes('Best Laptops')) {
      // Check if product placeholders exist
      const productPlaceholderCount = (processedContent.match(/product-placeholder/g) || []).length;
      const productDataCount = (processedContent.match(/product-data/g) || []).length;
      
      if (productPlaceholderCount === 0 && productDataCount === 0) {
        console.log(`⚠️ No product placeholders found in Top10 content, adding placeholders...`);
        
        // Find h3 tags that might be product titles
        const h3Tags = processedContent.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
        
        // If we have h3 tags, add placeholders after them
        if (h3Tags.length > 0) {
          for (let i = 0; i < Math.min(h3Tags.length, 10); i++) {
            const placeholder = `<div class="product-placeholder" data-asin="PRODUCT_ASIN_HERE" data-index="${i+1}"></div>`;
            processedContent = processedContent.replace(
              h3Tags[i], 
              `${h3Tags[i]}\n\n${placeholder}`
            );
          }
          console.log(`✅ Added product placeholders after ${Math.min(h3Tags.length, 10)} h3 tags`);
        }
      }
    }
    
    console.log(`✅ HTML structure processing complete`);
    return processedContent;
  } catch (error) {
    console.error(`❌ Error formatting HTML:`, error);
    // Return original content if there's an error
    return content;
  }
}

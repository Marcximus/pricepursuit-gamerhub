
/**
 * Functions for processing Top10 content
 */
import { generateProductHtml } from './htmlGenerator';

// Clean up the content by removing tags and excerpt
export function cleanupContent(content: string): string {
  // Remove the excerpt
  let processedContent = content.replace(/\*\*Excerpt:\*\*.*?---/s, '');
  
  // Remove the tags
  processedContent = processedContent.replace(/\*\*Tags:\*\*.*$/s, '');
  
  return processedContent;
}

// Fix HTML tags that might be malformed in the AI response
export function fixHtmlTags(content: string): string {
  let processedContent = content;
  
  // Ensure h1 tags are properly formatted (the AI sometimes forgets to close them)
  processedContent = processedContent.replace(/<h1([^>]*)>([^<]*)/g, '<h1$1>$2</h1>');
  
  // Fix paragraph tags - ensure they're properly wrapped
  processedContent = processedContent.replace(/<p>([^<]*?)(?=<(?!\/p>))/g, '<p>$1</p>');
  
  // Ensure other heading tags are properly closed
  processedContent = processedContent.replace(/<h([2-6])([^>]*)>([^<]*)/g, '<h$1$2>$3</h$1>');
  
  // Fix any unclosed list items
  processedContent = processedContent.replace(/<li>([^<]*?)(?=<(?!\/li>))/g, '<li>$1</li>');
  
  // Clean up any product-placeholder divs that might be malformed
  processedContent = processedContent.replace(/<div class="product-placeholder"[^>]*>.*?<\/div>/g, '[PRODUCT_PLACEHOLDER]');
  
  // Remove duplicate product cards that might already be in the content
  processedContent = processedContent.replace(/<div class="product-card[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '[PRODUCT_PLACEHOLDER]');
  
  // Wrap plain text blocks in <p> tags if they're not already wrapped
  processedContent = processedContent.replace(/(?<=>)([^<]+)(?=<)/g, (match, p1) => {
    // Skip if it's just whitespace
    if (p1.trim() === '') return p1;
    // Otherwise wrap in paragraph tags
    return `<p>${p1}</p>`;
  });
  
  return processedContent;
}

// Replace product placeholders with actual product HTML
export function replaceProductPlaceholders(content: string, products: any[]): { 
  content: string; 
  replacementsCount: number 
} {
  // First, clean up the content of any existing product cards
  let processedContent = content;
  let replacementsCount = 0;
  
  // Log number of products vs product placeholders
  console.log(`🔄 Processing ${products.length} products for Top10 content`);
  
  // Limit to exactly 10 products for Top10 lists
  const productLimit = Math.min(products.length, 10);
  console.log(`🔢 Will use exactly ${productLimit} products for the Top10 list`);
  
  // Remove all existing product cards to prevent duplication
  processedContent = processedContent.replace(/<div class="product-card[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '[PRODUCT_PLACEHOLDER]');
  
  // Extract all potential places where products should be inserted
  const placeholders = [
    ...processedContent.matchAll(/<div class="product-placeholder"[^>]*>\s*\[PRODUCT_DATA_(\d+)\]\s*<\/div>/g),
    ...processedContent.matchAll(/\[PRODUCT_DATA_(\d+)\]/g),
    ...processedContent.matchAll(/\[PRODUCT_PLACEHOLDER\]/g)
  ];
  
  console.log(`📍 Found ${placeholders.length} potential product placeholders`);
  
  // If we have explicit numbered placeholders like [PRODUCT_DATA_1], use those first
  const numberedPlaceholders = new Map();
  placeholders.forEach(match => {
    if (match[1]) {
      const productNum = parseInt(match[1], 10);
      if (!numberedPlaceholders.has(productNum)) {
        numberedPlaceholders.set(productNum, match[0]);
      }
    }
  });
  
  // For each explicitly numbered placeholder, insert the corresponding product
  for (let i = 1; i <= productLimit; i++) {
    const placeholder = numberedPlaceholders.get(i);
    
    if (placeholder && i <= products.length) {
      const product = products[i - 1];
      const productHtml = generateProductHtml(product, i);
      processedContent = processedContent.replace(placeholder, productHtml);
      replacementsCount++;
    }
  }
  
  // If we still have products left and there are un-numbered placeholders, use those
  const remainingPlaceholders = processedContent.match(/\[PRODUCT_PLACEHOLDER\]/g) || [];
  let placeholderIndex = 0;
  
  for (let i = 0; i < productLimit; i++) {
    if (replacementsCount >= productLimit) break;
    
    if (placeholderIndex < remainingPlaceholders.length) {
      const product = products[i];
      const productHtml = generateProductHtml(product, i + 1);
      processedContent = processedContent.replace('[PRODUCT_PLACEHOLDER]', productHtml);
      replacementsCount++;
      placeholderIndex++;
    }
  }
  
  // If we STILL haven't placed all products, append them after suitable headings
  if (replacementsCount < productLimit) {
    console.log(`⚠️ Didn't find enough placeholders, will attempt to insert products after headings`);
    
    // Find all h3 tags that might be product titles
    const h3Tags = [...processedContent.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)];
    
    for (let i = 0; i < Math.min(h3Tags.length, productLimit); i++) {
      if (replacementsCount >= productLimit) break;
      
      if (i < h3Tags.length && i < products.length) {
        const h3Tag = h3Tags[i][0];
        const h3Position = processedContent.indexOf(h3Tag) + h3Tag.length;
        
        // Check if there's already a product card after this heading
        const nextChunk = processedContent.substring(h3Position, h3Position + 200);
        if (!nextChunk.includes('product-card')) {
          const product = products[i];
          const productHtml = generateProductHtml(product, i + 1);
          
          processedContent = 
            processedContent.substring(0, h3Position) + 
            '\n\n' + productHtml + '\n\n' + 
            processedContent.substring(h3Position);
          
          replacementsCount++;
        }
      }
    }
  }
  
  // Final fallback: if we still haven't placed all products, add them at the end
  if (replacementsCount < productLimit) {
    console.log(`⚠️ Fallback: Adding remaining products at the end of content`);
    processedContent += '\n<h2>Top Lenovo Laptops</h2>\n';
    
    for (let i = replacementsCount; i < productLimit; i++) {
      if (i < products.length) {
        const product = products[i];
        processedContent += '\n\n' + generateProductHtml(product, i + 1);
        replacementsCount++;
      }
    }
  }
  
  // Clean up any remaining placeholders
  processedContent = processedContent.replace(/\[PRODUCT_DATA_\d+\]/g, '');
  processedContent = processedContent.replace(/\[PRODUCT_PLACEHOLDER\]/g, '');
  processedContent = processedContent.replace(/<div class="product-placeholder"[^>]*>.*?<\/div>/g, '');
  
  return { content: processedContent, replacementsCount };
}

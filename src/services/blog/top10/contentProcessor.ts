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
  let processedContent = content;
  let replacementsCount = 0;
  
  // Log number of products vs product placeholders
  console.log(`🔄 Processing ${products.length} products for Top10 content`);
  
  // Limit to exactly 10 products for Top10 lists
  const productLimit = Math.min(products.length, 10);
  console.log(`🔢 Will use exactly ${productLimit} products for the Top10 list`);
  
  // Process both standard div placeholders and raw product data mentions
  for (let i = 0; i < productLimit; i++) {
    const product = products[i];
    const productNum = i + 1;
    
    // Look for the product card HTML that appears as text in the content
    const productCardRegex = new RegExp(`\\s*<div class="product-card"[^>]*>([\\s\\S]*?)<\\/div>\\s*`, 'g');
    
    if (product) {
      let productHtml = product.htmlContent;
      
      // If htmlContent is missing but we have product data, generate it on the fly
      if (!productHtml) {
        console.warn(`⚠️ No HTML content found for product #${productNum}`);
        console.log(`Product data exists but htmlContent is missing. Title: ${product.title || 'Unknown'}`);
        productHtml = generateProductHtml(product, productNum);
      }
      
      // Replace the product card HTML that's showing as text
      if (productCardRegex.test(processedContent)) {
        processedContent = processedContent.replace(productCardRegex, '\n' + productHtml + '\n');
        replacementsCount += 1;
      }
      
      // Also replace any remaining placeholders
      const divPlaceholder = `<div class="product-placeholder" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
      const rawPlaceholder = `[PRODUCT_DATA_${productNum}]`;
      
      if (processedContent.includes(divPlaceholder)) {
        processedContent = processedContent.split(divPlaceholder).join(productHtml);
        replacementsCount += 1;
      }
      
      if (processedContent.includes(rawPlaceholder)) {
        processedContent = processedContent.split(rawPlaceholder).join(productHtml);
        replacementsCount += 1;
      }
      
      // Replace product placeholders with data-asin attribute
      const asinPlaceholderRegex = new RegExp(`<div class="product-placeholder"[^>]*data-asin="${product.asin}"[^>]*><\\/div>`, 'g');
      if (asinPlaceholderRegex.test(processedContent)) {
        processedContent = processedContent.replace(asinPlaceholderRegex, productHtml);
        replacementsCount += 1;
      }
    }
  }
  
  return { content: processedContent, replacementsCount };
}

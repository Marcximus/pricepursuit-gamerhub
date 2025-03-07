
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
      const divPlaceholder = `<div class="product-data" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
      const rawPlaceholder = `[PRODUCT_DATA_${productNum}]`;
      
      if (processedContent.includes(divPlaceholder)) {
        processedContent = processedContent.split(divPlaceholder).join(productHtml);
        replacementsCount += 1;
      }
      
      if (processedContent.includes(rawPlaceholder)) {
        processedContent = processedContent.split(rawPlaceholder).join(productHtml);
        replacementsCount += 1;
      }
    }
  }
  
  return { content: processedContent, replacementsCount };
}

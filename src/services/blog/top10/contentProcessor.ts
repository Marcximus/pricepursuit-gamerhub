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
  
  // First, remove any existing product cards that might be in text form
  processedContent = processedContent.replace(/<div class="product-card"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '[PRODUCT_PLACEHOLDER]');
  
  // Process placeholders in order
  for (let i = 0; i < productLimit; i++) {
    const product = products[i];
    const productNum = i + 1;
    
    if (product) {
      // Generate fresh HTML for each product to avoid any issues with existing HTML
      const productHtml = generateProductHtml(product, productNum);
      
      // Replace placeholders with our properly formatted product HTML
      const divPlaceholder = `<div class="product-placeholder" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
      const rawPlaceholder = `[PRODUCT_DATA_${productNum}]`;
      const simplePlaceholder = `[PRODUCT_PLACEHOLDER]`;
      
      if (processedContent.includes(divPlaceholder)) {
        processedContent = processedContent.replace(divPlaceholder, productHtml);
        replacementsCount += 1;
      } else if (processedContent.includes(rawPlaceholder)) {
        processedContent = processedContent.replace(rawPlaceholder, productHtml);
        replacementsCount += 1;
      } else if (processedContent.includes(simplePlaceholder) && i === 0) {
        // Replace the first placeholder we find with the product HTML
        processedContent = processedContent.replace(simplePlaceholder, productHtml);
        replacementsCount += 1;
      } else {
        // If no specific placeholder for this product number, add it at the end
        if (i === 0) {
          const h2Match = processedContent.match(/<h2[^>]*>.*?<\/h2>/i);
          if (h2Match && h2Match.index) {
            const insertPosition = h2Match.index + h2Match[0].length;
            processedContent = 
              processedContent.substring(0, insertPosition) + 
              '\n\n' + productHtml + '\n\n' + 
              processedContent.substring(insertPosition);
            replacementsCount += 1;
          } else {
            // No h2 found, append at the end
            processedContent += '\n\n' + productHtml;
            replacementsCount += 1;
          }
        } else {
          // For other products, just append them at the end
          processedContent += '\n\n' + productHtml;
          replacementsCount += 1;
        }
      }
      
      // Replace any remaining placeholders with the product rank
      processedContent = processedContent.replace(
        new RegExp(`\\[PRODUCT_DATA_${productNum}\\]`, 'g'), 
        `<strong>#${productNum} ${product.title || 'Lenovo Laptop'}</strong>`
      );
    }
  }
  
  return { content: processedContent, replacementsCount };
}

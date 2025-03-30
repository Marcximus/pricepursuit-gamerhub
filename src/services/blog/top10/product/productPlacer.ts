
/**
 * Product placement utilities for Top10 blog posts
 */
import { generateProductHtml } from '../generators/productGenerator';
import { fixProductNumbering, cleanupDuplicateContent } from './utils/productContentUtils';

/**
 * Replace product data placeholders with actual product content
 */
export function replaceProductPlaceholders(content: string, products: any[]): { 
  content: string; 
  replacementsCount: number 
} {
  let replacementsCount = 0;
  let updatedContent = content;
  
  console.log(`🧩 Starting product placeholder replacement with ${products.length} products`);
  
  // Match placeholders in the format [PRODUCT_DATA_X] where X is 1-10
  const placeholderPattern = /\[PRODUCT_DATA_(\d+)\]/g;
  const matches = [...updatedContent.matchAll(placeholderPattern)];
  const placeholderMatches = updatedContent.match(/\[PRODUCT_DATA_\d+\]/g) || [];
  console.log(`📍 Found ${placeholderMatches.length} potential product placeholders`);
  
  if (matches.length > 0) {
    // Use a simple zero-based array indexing approach
    // When a placeholder like [PRODUCT_DATA_1] is found, use products[0]
    // When a placeholder like [PRODUCT_DATA_2] is found, use products[1], etc.
    for (const match of matches) {
      const fullMatch = match[0]; // e.g., [PRODUCT_DATA_1]
      const placeholderNum = parseInt(match[1], 10); // e.g., 1
      const productIndex = placeholderNum - 1; // Convert to 0-based index
      
      if (productIndex >= 0 && productIndex < products.length) {
        const product = products[productIndex];
        if (product) {
          console.log(`✅ Replacing placeholder ${fullMatch} with product at index ${productIndex}: ${product.title?.substring(0, 30) || 'Unknown'}...`);
          console.log(`✅ Product specs: CPU: ${product.cpu || 'Not specified'}, RAM: ${product.ram || 'Not specified'}`);
          
          // Generate HTML for this product with the position number from the placeholder
          const productHtml = generateProductHtml(product, placeholderNum);
          
          // Replace the placeholder with the product HTML
          updatedContent = updatedContent.replace(fullMatch, productHtml);
          replacementsCount++;
        } else {
          console.warn(`⚠️ Product at index ${productIndex} is undefined or null`);
          // Remove the placeholder to avoid showing raw placeholders
          updatedContent = updatedContent.replace(fullMatch, '');
        }
      } else {
        console.warn(`⚠️ No product available at index ${productIndex} for placeholder ${fullMatch}`);
        // Remove the placeholder to avoid showing raw placeholders
        updatedContent = updatedContent.replace(fullMatch, '');
      }
    }
  } else {
    console.warn('⚠️ No product placeholders found in content');
  }
  
  console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
  
  // Clean up any JSON data artifacts that might be at the end of the content
  updatedContent = cleanupJsonProductsData(updatedContent);
  
  return { content: updatedContent, replacementsCount };
}

/**
 * Clean up any JSON products data that might be at the end of the content
 * This removes the raw JSON data from the final displayed content
 */
function cleanupJsonProductsData(content: string): string {
  // Look for the products array JSON at the end of the content
  const productsJsonPattern = /\"products\"\s*:\s*\[\s*\{[\s\S]*?\}\s*\]/g;
  return content.replace(productsJsonPattern, '');
}

/**
 * Remove duplicate product blocks that sometimes occur during generation
 */
export function removeDuplicateProductBlocks(content: string): string {
  // This pattern matches product card div elements
  const productBlockRegex = /<div\s+class="product-card[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  const blocks = Array.from(content.matchAll(productBlockRegex));
  
  console.log(`🔍 Found ${blocks.length} product blocks to check for duplicates`);
  
  // If we have few or no blocks, no need to do anything
  if (blocks.length <= 1) {
    return content;
  }
  
  // Check for duplicate blocks based on ASIN
  const seenAsins = new Set<string>();
  let result = content;
  
  for (const block of blocks) {
    const blockHtml = block[0];
    const asinMatch = blockHtml.match(/data-asin="([^"]+)"/);
    
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1];
      
      if (seenAsins.has(asin)) {
        // This is a duplicate, remove it
        console.log(`🧹 Removing duplicate product block for ASIN: ${asin}`);
        // We remove it by replacing the block with an empty string
        result = result.replace(blockHtml, '');
      } else {
        seenAsins.add(asin);
      }
    }
  }
  
  console.log(`✅ Removed ${blocks.length - seenAsins.size} duplicate product blocks`);
  
  return result;
}


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
  
  // Make sure products have correct position values for correct rank display
  const productsWithPositions = products.map((product, index) => ({
    ...product,
    position: index + 1, // Ensure correct order: first product is #1, last is #10
    rank: index + 1      // Also add rank for consistency
  }));
  
  // Log position values for debugging
  console.log('📊 Product positions after mapping:');
  productsWithPositions.forEach(p => console.log(`Position ${p.position}: ${p.title?.substring(0, 30) || 'Unknown'}`));
  
  // Find and replace [PRODUCT_DATA_X] placeholders
  for (let i = 1; i <= productsWithPositions.length; i++) {
    const placeholder = `[PRODUCT_DATA_${i}]`;
    
    if (updatedContent.includes(placeholder)) {
      // Get the product for this position, accounting for zero-based array indexing
      const product = productsWithPositions.find(p => p.position === i) || productsWithPositions[i-1];
      
      if (product) {
        console.log(`✅ Replacing placeholder ${placeholder} with product position ${product.position}: ${product.title?.substring(0, 30) || 'Unknown'}...`);
        
        // Log product specs for debugging
        console.log(`📋 Product specs: CPU: ${product.cpu || product.processor || 'Unknown'}, RAM: ${product.ram || 'Unknown'}`);
        
        // Generate HTML for this product with its position
        const productHtml = generateProductHtml(product, i);
        
        // Replace the placeholder with the product HTML
        updatedContent = updatedContent.replace(placeholder, productHtml);
        replacementsCount++;
      } else {
        console.warn(`⚠️ No product found for placeholder ${placeholder}`);
        // Replace with a message indicating missing product
        updatedContent = updatedContent.replace(
          placeholder, 
          `<div class="product-card bg-gray-100 p-4 text-center rounded-lg border border-gray-300">
            <p class="text-gray-600">Product information not available</p>
          </div>`
        );
        replacementsCount++;
      }
    }
  }
  
  // Now fix any issues with product numbering
  updatedContent = fixProductNumbering(updatedContent);
  
  // Clean up any duplicated content
  updatedContent = cleanupDuplicateContent(updatedContent);
  
  console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
  
  return { content: updatedContent, replacementsCount };
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

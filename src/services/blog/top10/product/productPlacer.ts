
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
  
  // Index products by array position (0-based) to match with placeholder numbers (1-based)
  // This simplifies the matching logic without complex fallback mechanisms
  const indexedProducts = [...products];
  
  // Log position values for debugging
  console.log('📊 Product positions before processing:');
  indexedProducts.forEach((p, idx) => console.log(`Index ${idx} (Position ${idx+1}): ${p.title?.substring(0, 30) || 'Unknown'}`));
  
  // Check if content contains explicit placeholders
  const hasExplicitPlaceholders = /\[PRODUCT_DATA_\d+\]/i.test(updatedContent);
  console.log(`📍 Found ${hasExplicitPlaceholders ? 'explicit' : 'no'} product placeholders`);
  
  // Count potential placeholders
  const placeholderMatches = updatedContent.match(/\[PRODUCT_DATA_\d+\]/g) || [];
  console.log(`📍 Found ${placeholderMatches.length} potential product placeholders`);
  
  // Find and replace [PRODUCT_DATA_X] placeholders with simple index-based matching
  for (let i = 1; i <= Math.min(10, products.length); i++) {
    const placeholder = `[PRODUCT_DATA_${i}]`;
    
    if (updatedContent.includes(placeholder)) {
      // Get product by array index (0-based, so i-1)
      const productIndex = i - 1;
      const product = indexedProducts[productIndex];
      
      if (product) {
        console.log(`✅ Replacing placeholder ${placeholder} with product at index ${productIndex}: ${product.title?.substring(0, 30) || 'Unknown'}...`);
        
        // Generate HTML for this product with its position
        const productHtml = generateProductHtml(product, i);
        
        // Replace the placeholder with the product HTML
        updatedContent = updatedContent.replace(placeholder, productHtml);
        replacementsCount++;
      } else {
        console.warn(`⚠️ No product available at index ${productIndex} for placeholder ${placeholder}`);
        
        // Just remove the placeholder to avoid breaking the layout
        updatedContent = updatedContent.replace(placeholder, '');
      }
    }
  }
  
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

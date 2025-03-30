
import { generateProductHtml } from '../generators/productGenerator';

export function replaceProductPlaceholders(
  content: string, 
  products: any[]
): { content: string; replacementsCount: number } {
  let newContent = content;
  let replacementsCount = 0;
  
  const placeholderPattern = /\[PRODUCT_DATA_(\d+)\]/g;
  const placeholders = [...newContent.matchAll(placeholderPattern)];
  console.log(`📍 Found ${placeholders.length} potential product placeholders`);
  
  if (placeholders.length >= 1) {
    // Replace explicit placeholders
    for (const match of placeholders) {
      const placeholderRank = parseInt(match[1], 10);
      
      // Find the product that matches this placeholder's rank/position
      const product = products.find(p => p.position === placeholderRank);
      
      if (product) {
        const productHtml = generateProductHtml(product, placeholderRank);
        newContent = newContent.replace(match[0], productHtml);
        replacementsCount++;
      } else {
        console.warn(`⚠️ No product found for placeholder rank ${placeholderRank}`);
      }
    }
  }
  
  return { content: newContent, replacementsCount };
}

/**
 * Remove duplicate product card blocks if any are present
 * This can happen if the AI includes product cards directly in the content
 * and we also add product cards through the placeholder replacement
 */
export function removeDuplicateProductBlocks(content: string): string {
  // Check if there are any product cards in the content
  if (!content.includes('product-card')) {
    return content;
  }
  
  console.log('🔄 Checking for duplicate product blocks...');
  
  // Find all product card divs with their data-asin attribute
  const productCardRegex = /<div[^>]*class="[^"]*product-card[^"]*"[^>]*data-asin="([^"]*)"[^>]*>/g;
  const productMatches = [...content.matchAll(productCardRegex)];
  
  // If there are no matches or just one, no duplicates to remove
  if (productMatches.length <= 1) {
    return content;
  }
  
  console.log(`📊 Found ${productMatches.length} product blocks, checking for duplicates`);
  
  // Track which ASINs we've seen to detect duplicates
  const seenAsins = new Set<string>();
  let dedupedContent = content;
  
  for (const match of productMatches) {
    const asin = match[1];
    const fullMatch = match[0];
    
    // If we've seen this ASIN before, it's a duplicate
    if (seenAsins.has(asin)) {
      console.log(`🗑️ Found duplicate product with ASIN: ${asin}, removing...`);
      
      // Find the start of the div
      const startIndex = dedupedContent.indexOf(fullMatch);
      if (startIndex !== -1) {
        // Find the matching closing div
        let depth = 1;
        let endIndex = startIndex + fullMatch.length;
        
        while (depth > 0 && endIndex < dedupedContent.length) {
          if (dedupedContent.substring(endIndex).startsWith('</div>')) {
            depth--;
            if (depth === 0) {
              endIndex += 6; // Length of </div>
              break;
            } else {
              endIndex += 6;
            }
          } else if (dedupedContent.substring(endIndex).startsWith('<div')) {
            depth++;
            // Skip to end of div opening tag
            const nextCloseTag = dedupedContent.indexOf('>', endIndex);
            endIndex = nextCloseTag + 1;
          } else {
            endIndex++;
          }
        }
        
        // Remove the duplicate product card
        dedupedContent = dedupedContent.substring(0, startIndex) + dedupedContent.substring(endIndex);
      }
    } else {
      seenAsins.add(asin);
    }
  }
  
  console.log(`✅ Removed ${productMatches.length - seenAsins.size} duplicate product blocks`);
  return dedupedContent;
}

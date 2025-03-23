/**
 * Main product placement functionality for Top10 blog posts
 */
import { generateProductHtml } from '../generators/productGenerator';
import { removeJsonFormatting } from '../contentProcessor';
import { replaceExplicitPlaceholders } from './strategies/explicitPlaceholders';
import { insertAfterHeadings } from './strategies/headingStrategy';
import { insertStrategically } from './strategies/strategicPlacement';
import { 
  fixProductNumbering,
  cleanupDuplicateContent,
  ensureConsistentProductLinks
} from './utils/productContentUtils';

/**
 * Replace product placeholders with actual product HTML
 * @param content The content with placeholders
 * @param products Array of product data
 * @returns Updated content with product HTML and replacement count
 */
export function replaceProductPlaceholders(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  console.log('🔄 Replacing product placeholders in content...');
  
  // Ensure we have products to work with
  if (!products || products.length === 0) {
    console.warn('⚠️ No products available for replacement');
    return { content, replacementsCount: 0 };
  }
  
  console.log(`🔄 Processing ${products.length} products for Top10 content`);
  
  // Limit to 10 products for Top10 lists
  const productsToUse = products.slice(0, 10);
  console.log(`🔢 Will use exactly ${productsToUse.length} products for the Top10 list`);
  
  // First, remove any raw JSON that might be in the content
  let newContent = removeJsonFormatting(content);
  
  // Different strategies for finding placeholders
  let replacementsCount = 0;
  
  // Strategy 1: Look for explicit placeholders like [PRODUCT_DATA_1]
  const replacementResult = replaceExplicitPlaceholders(newContent, productsToUse);
  newContent = replacementResult.content;
  replacementsCount = replacementResult.replacementsCount;
  
  // If Strategy 1 didn't find enough placeholders, try Strategy 2
  if (replacementsCount < 5) {
    console.log(`⚠️ Only found ${replacementsCount} explicit placeholders, trying heading strategy`);
    const headingResult = insertAfterHeadings(newContent, productsToUse);
    newContent = headingResult.content;
    replacementsCount = headingResult.replacementsCount;
    
    // If Strategy 2 didn't work, try Strategy 3
    if (replacementsCount < 5) {
      console.log(`⚠️ Still only ${replacementsCount} placeholders found, trying strategic placement`);
      const fallbackResult = insertStrategically(newContent, productsToUse);
      newContent = fallbackResult.content;
      replacementsCount = fallbackResult.replacementsCount;
    }
  }
  
  // Remove any remaining product placeholders
  newContent = newContent.replace(/\[PRODUCT_DATA_\d+\]/g, '');
  
  // Fix numbering in product headings and descriptions
  newContent = fixProductNumbering(newContent);
  
  // Remove any duplicate product blocks
  newContent = removeDuplicateProductBlocks(newContent);
  
  // Ensure product links match the heading content
  newContent = ensureConsistentProductLinks(newContent, productsToUse);
  
  // Clean up duplicate titles and ranking numbers
  newContent = cleanupDuplicateContent(newContent);
  
  console.log(`✅ Product placeholder replacement complete: ${replacementsCount} replacements`);
  return { content: newContent, replacementsCount };
}

/**
 * Remove duplicate product blocks from content
 */
export function removeDuplicateProductBlocks(content: string): string {
  // Find all product blocks
  const productBlockRegex = /<div class="product-card.*?Check Price on Amazon.*?<\/div>\s*<\/div>\s*<\/div>/gs;
  const productBlocks = [...content.matchAll(productBlockRegex)];
  
  console.log(`🔍 Found ${productBlocks.length} product blocks in content`);
  
  // If we have more than 10 product blocks, there are likely duplicates
  if (productBlocks.length > 10) {
    console.log(`⚠️ Detected ${productBlocks.length} product blocks - removing duplicates`);
    
    // Build a new content string keeping track of which blocks we've seen
    let newContent = content;
    const seenBlocks = new Set();
    let duplicatesRemoved = 0;
    
    // Process from the end to avoid index shifting issues
    for (let i = productBlocks.length - 1; i >= 0; i--) {
      const block = productBlocks[i];
      if (!block || !block[0] || block.index === undefined) continue;
      
      // Extract ASIN or some unique identifier
      const asinMatch = block[0].match(/data-asin="([^"]+)"/);
      const asin = asinMatch ? asinMatch[1] : '';
      
      // Check if this is a duplicate product
      const blockFingerprint = `${asin}-${i % 10}`; // Use position in top 10 as part of fingerprint
      
      if (seenBlocks.has(blockFingerprint)) {
        // Remove this duplicate block
        newContent = newContent.substring(0, block.index) + 
                    newContent.substring(block.index + block[0].length);
        duplicatesRemoved++;
      } else {
        seenBlocks.add(blockFingerprint);
      }
    }
    
    console.log(`✂️ Removed ${duplicatesRemoved} duplicate product blocks`);
    return newContent;
  }
  
  return content;
}

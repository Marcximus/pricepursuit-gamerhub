
/**
 * Product placement utilities for Top10 blog posts
 */
import { generateProductHtml } from './generators/productGenerator';

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
  console.log(`🔢 Will use exactly 10 products for the Top10 list`);
  
  // Different strategies for finding placeholders
  let newContent = content;
  let replacementsCount = 0;
  
  // Strategy 1: Look for explicit placeholders like [PRODUCT_DATA_1]
  const replacementResult = replaceExplicitPlaceholders(newContent, productsToUse);
  newContent = replacementResult.content;
  replacementsCount = replacementResult.replacementsCount;
  
  // If Strategy 1 didn't find enough placeholders, try Strategy 2
  if (replacementsCount < 5) {
    const headingResult = insertAfterHeadings(newContent, productsToUse);
    newContent = headingResult.content;
    replacementsCount = headingResult.replacementsCount;
    
    // If Strategy 2 didn't work, try Strategy 3
    if (replacementsCount < 5) {
      const fallbackResult = insertStrategically(newContent, productsToUse);
      newContent = fallbackResult.content;
      replacementsCount = fallbackResult.replacementsCount;
    }
  }
  
  // Remove any remaining product placeholders
  newContent = newContent.replace(/\[PRODUCT_DATA_\d+\]/g, '');
  
  // Remove any duplicate product blocks
  newContent = removeDuplicateProductBlocks(newContent);
  
  // Ensure product links match the heading content
  newContent = ensureConsistentProductLinks(newContent, productsToUse);
  
  console.log(`✅ Product placeholder replacement complete: ${replacementsCount} replacements`);
  return { content: newContent, replacementsCount };
}

/**
 * Replace explicit product placeholders in content
 * @param content The content with placeholders
 * @param products Array of product data
 * @returns Updated content and replacement count
 */
function replaceExplicitPlaceholders(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  let newContent = content;
  let replacementsCount = 0;
  
  const placeholderPattern = /\[PRODUCT_DATA_(\d+)\]/g;
  const placeholders = [...newContent.matchAll(placeholderPattern)];
  console.log(`📍 Found ${placeholders.length} potential product placeholders`);
  
  if (placeholders.length >= 5) {
    // Replace explicit placeholders
    for (const match of placeholders) {
      const index = parseInt(match[1], 10) - 1;
      if (index >= 0 && index < products.length) {
        const product = products[index];
        const productHtml = product.htmlContent || `<div>Product data missing for ${product.title || 'Unknown Product'}</div>`;
        newContent = newContent.replace(match[0], productHtml);
        replacementsCount++;
      }
    }
  }
  
  return { content: newContent, replacementsCount };
}

/**
 * Insert products after headings in content
 * @param content The content with headings
 * @param products Array of product data
 * @returns Updated content and replacement count
 */
function insertAfterHeadings(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  let newContent = content;
  let replacementsCount = 0;
  
  console.log(`⚠️ Didn't find enough placeholders, will attempt to insert products after headings`);
  
  // Look for h3 headings which likely represent products
  const headings = newContent.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
  
  if (headings.length >= 5) {
    // Insert products after headings
    for (let i = 0; i < Math.min(headings.length, products.length); i++) {
      const product = products[i];
      const productHtml = product.htmlContent || `<div>Product data missing for ${product.title || 'Unknown Product'}</div>`;
      
      // Replace any duplicate "#10" with the correct index
      const correctedHtml = productHtml.replace(/#10/g, `#${10 - i}`);
      
      // Find position of this heading
      const headingPos = newContent.indexOf(headings[i]);
      if (headingPos !== -1) {
        const insertPos = headingPos + headings[i].length;
        
        // First remove any existing product blocks that might already be there
        // This prevents duplicates when regenerating
        const nextHeadingPos = (i < headings.length - 1) ? 
          newContent.indexOf(headings[i+1]) : newContent.length;
        
        // Check if there's already a product card in this section
        const sectionContent = newContent.substring(insertPos, nextHeadingPos);
        const hasProductCard = sectionContent.includes('product-card') || 
                             sectionContent.includes('Check Price on Amazon');
        
        if (hasProductCard) {
          console.log(`⚠️ Product card already exists after heading ${i+1}, skipping insertion`);
        } else {
          // Insert after heading with some spacing
          newContent = 
            newContent.substring(0, insertPos) + 
            '\n\n' + correctedHtml + '\n\n' + 
            newContent.substring(insertPos);
          replacementsCount++;
        }
      }
    }
  }
  
  return { content: newContent, replacementsCount };
}

/**
 * Insert products at strategic points in content
 * @param content The content to update
 * @param products Array of product data
 * @returns Updated content and replacement count
 */
function insertStrategically(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  let newContent = content;
  let replacementsCount = 0;
  
  console.log(`⚠️ Not enough headings found, inserting products at strategic points`);
  
  // First find the introduction section
  const firstHeadingPos = newContent.indexOf('<h3');
  if (firstHeadingPos > 0) {
    // Check if there's already product content
    const hasProductBlocks = newContent.includes('product-card') || 
                          newContent.includes('Check Price on Amazon');
    
    if (!hasProductBlocks) {
      // Insert products between headings or at the end
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        // Make sure the HTML has the correct ranking
        const productHtml = (product.htmlContent || '')
          .replace(/#10/g, `#${10 - i}`);
        
        // Find the right position for this product
        const headingMatch = newContent.match(new RegExp(`<h3[^>]*>[^<]*?${product.title || 'Lenovo'}[^<]*?<\/h3>`, 'i'));
        
        if (headingMatch && headingMatch.index !== undefined) {
          // Insert after its corresponding heading
          const insertPos = headingMatch.index + headingMatch[0].length;
          
          // Check if there's already a product card in this section
          const nextHeadingPos = newContent.indexOf('<h3', insertPos);
          const sectionEnd = nextHeadingPos > -1 ? nextHeadingPos : newContent.length;
          const sectionContent = newContent.substring(insertPos, sectionEnd);
          
          if (!sectionContent.includes('product-card') && 
              !sectionContent.includes('Check Price on Amazon')) {
            // Insert after heading with spacing
            newContent = 
              newContent.substring(0, insertPos) + 
              '\n\n' + productHtml + '\n\n' + 
              newContent.substring(insertPos);
            replacementsCount++;
          }
        } else {
          // Fallback: Add at the end
          newContent += `\n\n${productHtml}\n\n`;
          replacementsCount++;
        }
      }
    } else {
      console.log(`⚠️ Product blocks already exist in content, skipping addition`);
    }
  }
  
  return { content: newContent, replacementsCount };
}

/**
 * Remove duplicate product blocks from content
 * @param content The content with potential duplicate products
 * @returns Content with duplicates removed
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

/**
 * Ensure product links in content match the heading titles
 * This helps avoid mismatches between described products and linked ones
 */
function ensureConsistentProductLinks(content: string, products: any[]): string {
  // Find all product sections with headings
  const headingSections = content.match(/<h[23][^>]*>(.*?)<\/h[23]>/gi) || [];
  console.log(`🔍 Found ${headingSections.length} product headings for consistency check`);
  
  if (headingSections.length === 0 || products.length === 0) {
    return content;
  }
  
  let newContent = content;
  
  // For each heading, find the product card that follows it
  for (let i = 0; i < Math.min(headingSections.length, products.length); i++) {
    const headingMatch = headingSections[i].match(/<h[23][^>]*>(.*?)<\/h[23]>/i);
    if (!headingMatch || !headingMatch[1]) continue;
    
    // Extract the heading text and clean it
    const headingText = headingMatch[1].trim();
    
    // Find the product that best matches this heading
    let bestMatchIndex = i; // Default to the same position
    let bestMatchScore = 0;
    
    for (let j = 0; j < products.length; j++) {
      const product = products[j];
      const productTitle = product.title || '';
      
      // Calculate simple match score based on common words
      const headingWords = headingText.toLowerCase().split(/\s+/);
      const productWords = productTitle.toLowerCase().split(/\s+/);
      
      let matchScore = 0;
      for (const word of headingWords) {
        if (word.length > 2 && productWords.includes(word)) {
          matchScore++;
        }
      }
      
      if (matchScore > bestMatchScore) {
        bestMatchScore = matchScore;
        bestMatchIndex = j;
      }
    }
    
    // Use the best matching product for this section
    const matchedProduct = products[bestMatchIndex];
    
    // Find the product card after this heading
    const headingPos = newContent.indexOf(headingSections[i]);
    if (headingPos === -1) continue;
    
    // Search for a product card in the next 2000 characters
    const sectionEnd = Math.min(headingPos + 2000, newContent.length);
    const sectionText = newContent.substring(headingPos, sectionEnd);
    
    // Find the product card in this section
    const productCardMatch = sectionText.match(/<div class="product-card.*?<\/div>\s*<\/div>\s*<\/div>/s);
    if (!productCardMatch) continue;
    
    // Extract the full product card HTML
    const productCardHtml = productCardMatch[0];
    
    // Generate new product HTML for the matched product
    // Use the imported function instead of require
    const newProductHtml = generateProductHtml(matchedProduct, bestMatchIndex);
    
    // Replace the old product card with the new one that matches the heading
    newContent = newContent.replace(productCardHtml, newProductHtml);
    console.log(`✅ Updated product link for "${headingText}" to match described product`);
  }
  
  return newContent;
}

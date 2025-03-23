/**
 * Content processing utilities for Top10 blog posts
 */

/**
 * Clean up AI-generated content
 */
export function cleanupContent(content: string): string {
  console.log('🧹 Cleaning up Top10 content...');
  
  // Remove any doubled-up HTML tags
  let cleaned = content
    .replace(/<p><p>/g, '<p>')
    .replace(/<\/p><\/p>/g, '</p>')
    .replace(/<h1><h1>/g, '<h1>')
    .replace(/<\/h1><\/h1>/g, '</h1>');
  
  // Fix empty heading tags
  cleaned = cleaned.replace(/<h1>\s*<\/h1>/g, '<h1>Top 10 Best Lenovo Laptops</h1>');
  
  console.log('✅ Content cleaned successfully');
  return cleaned;
}

/**
 * Fix malformed HTML tags in AI-generated content
 */
export function fixHtmlTags(content: string): string {
  console.log('🔧 Fixing HTML tags in content...');
  
  let fixed = content;
  
  // Fix unclosed tags
  const commonTags = ['p', 'h1', 'h2', 'h3', 'ul', 'li', 'div', 'span'];
  commonTags.forEach(tag => {
    // Count opening and closing tags
    const openCount = (fixed.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
    const closeCount = (fixed.match(new RegExp(`<\\/${tag}>`, 'g')) || []).length;
    
    console.log(`📊 Tag <${tag}>: ${openCount} opening, ${closeCount} closing`);
    
    // Fix if imbalanced
    if (openCount > closeCount) {
      console.log(`⚠️ Fixing unclosed <${tag}> tags`);
      const diff = openCount - closeCount;
      for (let i = 0; i < diff; i++) {
        fixed += `</${tag}>`;
      }
    }
  });
  
  // Remove any visible HTML tags in text
  fixed = fixed.replace(/&lt;[^&]*&gt;/g, '');
  
  console.log('✅ HTML tags fixed successfully');
  return fixed;
}

/**
 * Replace product placeholders with actual product HTML
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
  const placeholderPattern = /\[PRODUCT_DATA_(\d+)\]/g;
  const placeholders = [...newContent.matchAll(placeholderPattern)];
  console.log(`📍 Found ${placeholders.length} potential product placeholders`);
  
  if (placeholders.length >= 5) {
    // Replace explicit placeholders
    for (const match of placeholders) {
      const index = parseInt(match[1], 10) - 1;
      if (index >= 0 && index < productsToUse.length) {
        const product = productsToUse[index];
        const productHtml = product.htmlContent || `<div>Product data missing for ${product.title || 'Unknown Product'}</div>`;
        newContent = newContent.replace(match[0], productHtml);
        replacementsCount++;
      }
    }
  } else {
    // Strategy 2: Find headings and insert products after them
    console.log(`⚠️ Didn't find enough placeholders, will attempt to insert products after headings`);
    
    // Look for h3 headings which likely represent products
    const headings = newContent.match(/<h3[^>]*>.*?<\/h3>/gi) || [];
    
    if (headings.length >= 5) {
      // Insert products after headings
      for (let i = 0; i < Math.min(headings.length, productsToUse.length); i++) {
        const product = productsToUse[i];
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
    } else {
      // Strategy 3: Fallback - add products at the end
      console.log(`⚠️ Not enough headings found, inserting products at strategic points`);
      
      // First find the introduction section
      const firstHeadingPos = newContent.indexOf('<h3');
      if (firstHeadingPos > 0) {
        // Check if there's already product content
        const hasProductBlocks = newContent.includes('product-card') || 
                                newContent.includes('Check Price on Amazon');
        
        if (!hasProductBlocks) {
          // Insert products between headings or at the end
          for (let i = 0; i < productsToUse.length; i++) {
            const product = productsToUse[i];
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
    }
  }
  
  // Remove any remaining product placeholders
  newContent = newContent.replace(/\[PRODUCT_DATA_\d+\]/g, '');
  
  // Remove any duplicate product blocks
  newContent = removeDuplicateProductBlocks(newContent);
  
  console.log(`✅ Product placeholder replacement complete: ${replacementsCount} replacements`);
  return { content: newContent, replacementsCount };
}

/**
 * Remove duplicate product blocks from content
 */
function removeDuplicateProductBlocks(content: string): string {
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

/**
 * Product placement utilities for Top10 blog posts
 */
import { generateProductHtml } from '../generators/productGenerator';
import { extractProductSpecs } from '../contentProcessor';

/**
 * Replace product placeholders with actual product HTML
 */
export function replaceProductPlaceholders(content: string, products: any[]): { content: string, replacementsCount: number } {
  if (!content || !products || products.length === 0) {
    console.warn('⚠️ Cannot replace product placeholders - missing content or products');
    return { content, replacementsCount: 0 };
  }
  
  let replacementsCount = 0;
  let updatedContent = content;
  
  // Extract product specifications from the content
  const extractedSpecs = extractProductSpecs(content);
  console.log(`📊 Extracted ${extractedSpecs.length} product specifications from content`);
  
  // Merge the extracted specs with the product data
  if (extractedSpecs.length > 0) {
    for (let i = 0; i < Math.min(extractedSpecs.length, products.length); i++) {
      // Find the matching spec by position
      const spec = extractedSpecs.find(s => s.position === (i + 1)) || extractedSpecs[i];
      if (spec) {
        products[i].cpu = spec.cpu || products[i].cpu || products[i].processor || '';
        products[i].ram = spec.ram || products[i].ram || '';
        products[i].graphics = spec.graphics || products[i].graphics || '';
        products[i].storage = spec.storage || products[i].storage || '';
        products[i].screen = spec.screen || products[i].screen_size || '';
        products[i].battery = spec.battery || products[i].battery_life || '';
        
        console.log(`✅ Merged specifications for product #${i + 1}`);
      }
    }
  }
  
  // Process standard [PRODUCT_DATA_X] placeholders
  const placeholderPattern = /\[PRODUCT_DATA_(\d+)\]/g;
  let match;
  
  while ((match = placeholderPattern.exec(content)) !== null) {
    const fullMatch = match[0];
    const position = parseInt(match[1], 10);
    
    // Adjust for zero-based array
    const productIndex = position - 1;
    
    if (products[productIndex]) {
      const product = products[productIndex];
      
      // If the product already has generated HTML content, use it
      if (product.htmlContent) {
        updatedContent = updatedContent.replace(fullMatch, product.htmlContent);
      } else {
        // Otherwise generate the HTML
        try {
          const productHtml = generateProductHtml(product, productIndex);
          updatedContent = updatedContent.replace(fullMatch, productHtml);
        } catch (error) {
          console.error(`⚠️ Error generating HTML for product at position ${position}:`, error);
          // Replace with a simple placeholder if generation fails
          updatedContent = updatedContent.replace(fullMatch, `<div class="error-product-card">Product data could not be loaded</div>`);
        }
      }
      
      replacementsCount++;
    } else {
      console.warn(`⚠️ No product data available for position ${position}`);
      // Replace with message if product not found
      updatedContent = updatedContent.replace(fullMatch, `<div class="missing-product-card">Product ${position} not available</div>`);
    }
  }
  
  // If no replacements were made but we have products, try to add them after each H3
  if (replacementsCount === 0 && updatedContent.includes('<h3>')) {
    console.log('⚠️ No product placeholders found, trying to add products after each H3 tag');
    
    // Don't modify the original content until we're sure about all replacements
    let tempContent = updatedContent;
    let h3Matches = [...tempContent.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)];
    
    if (h3Matches.length > 0) {
      for (let i = 0; i < Math.min(h3Matches.length, products.length); i++) {
        const h3Match = h3Matches[i];
        const h3EndTag = h3Match.index + h3Match[0].length;
        
        // Generate product HTML - with proper product ranking
        const productHtml = generateProductHtml(products[i], i);
        
        // Insert product HTML after the </h3> tag
        tempContent = tempContent.substring(0, h3EndTag) + 
                      productHtml + 
                      tempContent.substring(h3EndTag);
        
        // Adjust indices of subsequent matches due to inserted content
        for (let j = i + 1; j < h3Matches.length; j++) {
          h3Matches[j].index += productHtml.length;
        }
        
        replacementsCount++;
      }
      
      updatedContent = tempContent;
    }
  }
  
  // Clean up any remaining raw JSON data
  updatedContent = removeJsonData(updatedContent);
  
  console.log(`📊 Replaced ${replacementsCount} product placeholders in content`);
  return { content: updatedContent, replacementsCount };
}

/**
 * Remove duplicate product blocks that might have been added by mistake
 */
export function removeDuplicateProductBlocks(content: string): string {
  if (!content) return content;
  
  // Look for duplicate product-card divs
  const productCardPattern = /<div\s+class="product-card"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g;
  const productCards = [...content.matchAll(productCardPattern)];
  
  // Check for duplicates based on ASIN
  const productAsins = new Set();
  let cleanedContent = content;
  
  for (const match of productCards) {
    const asinMatch = match[0].match(/data-asin="([^"]+)"/);
    
    if (asinMatch && asinMatch[1]) {
      const asin = asinMatch[1];
      
      if (productAsins.has(asin)) {
        // This is a duplicate, remove it
        cleanedContent = cleanedContent.replace(match[0], '');
        console.log(`🧹 Removed duplicate product card with ASIN: ${asin}`);
      } else {
        // First occurrence, add to set
        productAsins.add(asin);
      }
    }
  }
  
  return cleanedContent;
}

/**
 * Remove raw JSON data from the content
 */
function removeJsonData(content: string): string {
  // Remove the raw products JSON array that might be at the end of the content
  return content.replace(/"products"\s*:\s*\[\s*\{[\s\S]*?\}\s*\]\s*}/g, '');
}

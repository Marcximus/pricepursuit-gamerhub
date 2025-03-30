
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

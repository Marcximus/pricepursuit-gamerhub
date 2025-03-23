
/**
 * Strategy for replacing explicit product placeholders in content
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Replace explicit product placeholders in content
 */
export function replaceExplicitPlaceholders(
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
      const index = parseInt(match[1], 10) - 1;
      if (index >= 0 && index < products.length) {
        const product = products[index];
        // Proper rank for this product: #10 for first, counting down to #1 for last
        const rank = products.length - index;
        const productHtml = generateProductHtml(product, rank);
        newContent = newContent.replace(match[0], productHtml);
        replacementsCount++;
      }
    }
  }
  
  return { content: newContent, replacementsCount };
}

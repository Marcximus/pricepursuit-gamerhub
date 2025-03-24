
/**
 * Strategy for inserting products strategically in Top10 blog posts
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Insert products strategically in the content as a fallback
 * @param content The content
 * @param products Array of product data
 * @returns Updated content with product HTML and replacement count
 */
export function insertStrategically(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  console.log('🔍 Using strategic product placement as fallback...');
  
  // If no products are available, return the original content
  if (!products || products.length === 0) {
    console.warn('⚠️ No products available for strategic placement');
    return { content, replacementsCount: 0 };
  }
  
  // Split the content into paragraphs
  const paragraphs = content.split('</p>');
  
  // Ensure we have enough paragraphs to insert products
  if (paragraphs.length < products.length) {
    console.warn(`⚠️ Not enough paragraphs (${paragraphs.length}) for all products (${products.length})`);
  }
  
  // Calculate insertion points - we'll place products evenly throughout the content
  const insertionPoints = [];
  const numProducts = Math.min(products.length, 10);  // Limit to 10 products
  
  // Determine ideal spacing between products
  const spacing = Math.max(1, Math.floor(paragraphs.length / (numProducts + 1)));
  
  // Calculate insertion positions
  for (let i = 0; i < numProducts; i++) {
    const position = (i + 1) * spacing;
    if (position < paragraphs.length) {
      insertionPoints.push(position);
    }
  }
  
  console.log(`🔧 Calculated ${insertionPoints.length} insertion points with spacing ${spacing}`);
  
  // Insert products at calculated points
  let newContent = '';
  let replacementsCount = 0;
  
  paragraphs.forEach((paragraph, index) => {
    // Add the paragraph
    newContent += paragraph + (index < paragraphs.length - 1 ? '</p>' : '');
    
    // Check if this is an insertion point
    const insertionIndex = insertionPoints.indexOf(index);
    if (insertionIndex !== -1 && insertionIndex < products.length) {
      // Generate the product HTML - index corresponds to rank (10 to 1)
      const productHtml = generateProductHtml(products[insertionIndex], insertionIndex);
      
      // Add the product HTML
      newContent += '\n' + productHtml + '\n';
      replacementsCount++;
      
      console.log(`✅ Strategically inserted product at paragraph ${index}`);
    }
  });
  
  console.log(`✅ Strategically inserted ${replacementsCount} products`);
  return { content: newContent, replacementsCount };
}

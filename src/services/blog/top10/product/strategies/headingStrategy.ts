
/**
 * Strategy for inserting products after headings in Top10 blog posts
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Insert products after headings in the content
 * @param content The content with headings
 * @param products Array of product data
 * @returns Updated content with product HTML and replacement count
 */
export function insertAfterHeadings(
  content: string,
  products: any[]
): { content: string; replacementsCount: number } {
  console.log('🔍 Looking for headings to insert products after...');
  
  // If no products are available, return the original content
  if (!products || products.length === 0) {
    console.warn('⚠️ No products available for heading insertion');
    return { content, replacementsCount: 0 };
  }
  
  // Find all H3 headings in the content
  const headingRegex = /<h3>(.*?)<\/h3>/g;
  let newContent = content;
  let replacementsCount = 0;
  let match;
  
  // Store each match and then process them
  const matches = [];
  while ((match = headingRegex.exec(content)) !== null) {
    // Skip if heading already has a product card after it
    const nextContent = content.substring(match.index + match[0].length, match.index + match[0].length + 200);
    if (nextContent.includes('product-card')) {
      continue;
    }
    
    matches.push({
      fullMatch: match[0],
      headingContent: match[1],
      index: match.index
    });
  }
  
  console.log(`🔍 Found ${matches.length} headings without products`);
  
  // Process each heading
  matches.forEach((match, index) => {
    // Skip if we're out of products
    if (index >= products.length) {
      return;
    }
    
    // Generate the product HTML
    const productHtml = generateProductHtml(products[index], index);
    
    // Replace the heading with the heading + product HTML
    newContent = newContent.replace(
      match.fullMatch,
      `${match.fullMatch}\n${productHtml}`
    );
    
    replacementsCount++;
    console.log(`✅ Inserted product after heading: ${match.headingContent.substring(0, 30)}...`);
  });
  
  console.log(`✅ Inserted ${replacementsCount} products after headings`);
  return { content: newContent, replacementsCount };
}

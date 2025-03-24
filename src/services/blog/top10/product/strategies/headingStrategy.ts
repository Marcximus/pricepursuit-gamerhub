
/**
 * Strategy for inserting products after headings in content
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Insert products after headings in content
 */
export function insertAfterHeadings(
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
      
      // Generate product HTML with appropriate rank
      const rank = products.length - i;
      const productHtml = generateProductHtml(product, rank);
      
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
            '\n\n' + productHtml + '\n\n' + 
            newContent.substring(insertPos);
          replacementsCount++;
        }
      }
    }
  }
  
  return { content: newContent, replacementsCount };
}

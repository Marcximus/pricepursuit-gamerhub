
/**
 * Strategy for inserting products at strategic points in content
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Insert products at strategic points in content
 */
export function insertStrategically(
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
                          newContent.includes('View Now on Amazon');
    
    if (!hasProductBlocks) {
      // Insert products between headings or at the end
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        // Generate product HTML with appropriate rank
        const rank = products.length - i;
        const productHtml = generateProductHtml(product, rank);
        
        // Find the right position for this product
        const title = product.title || '';
        const modelInfo = product.model || '';
        const titleWords = [
          ...title.split(' ').slice(0, 3),
          ...(modelInfo ? modelInfo.split(' ') : [])
        ];
        
        // Create a regex pattern that looks for headings containing any of the first few words from title/model
        const titleWordsRegex = titleWords
          .filter(word => word.length > 3)  // Only use meaningful words
          .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))  // Escape regex special chars
          .join('|');
        
        const headingPattern = titleWordsRegex ? 
          new RegExp(`<h3[^>]*>(?:[^<]*?(?:${titleWordsRegex})[^<]*?)<\/h3>`, 'i') :
          null;
        
        const headingMatch = headingPattern ? newContent.match(headingPattern) : null;
        
        if (headingMatch && headingMatch.index !== undefined) {
          // Insert after its corresponding heading
          const insertPos = headingMatch.index + headingMatch[0].length;
          
          // Check if there's already a product card in this section
          const nextHeadingPos = newContent.indexOf('<h3', insertPos);
          const sectionEnd = nextHeadingPos > -1 ? nextHeadingPos : newContent.length;
          const sectionContent = newContent.substring(insertPos, sectionEnd);
          
          if (!sectionContent.includes('product-card') && 
              !sectionContent.includes('View Now on Amazon')) {
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


/**
 * Utility functions for processing and fixing product content
 */
import { generateProductHtml } from '../../generators/productGenerator';

/**
 * Fix numbering in product headings and descriptions
 */
export function fixProductNumbering(content: string): string {
  let newContent = content;
  
  // Find all headings that look like product headings (#10, #9, etc.)
  const headingPattern = /<h[23][^>]*>\s*#?\d+\s+/g;
  const headings = [...newContent.matchAll(headingPattern)];
  
  if (headings.length > 0) {
    // Sort headings by position to ensure we process them in order
    headings.sort((a, b) => (a.index || 0) - (b.index || 0));
    
    // Create a mapping for what each heading's rank should be
    const correctRanks = new Map();
    for (let i = 0; i < headings.length; i++) {
      // In a top-10 list, the first product should be #1, and the last should be #10
      const correctRank = headings.length - i;
      const currentHeading = headings[i][0];
      
      // Extract the current rank number
      const currentRankMatch = currentHeading.match(/#?(\d+)/);
      if (currentRankMatch && currentRankMatch[1]) {
        const currentRank = parseInt(currentRankMatch[1], 10);
        correctRanks.set(currentRank, correctRank);
      }
    }
    
    // Replace all instances of the incorrect rank with the correct rank
    for (const [oldRank, newRank] of correctRanks.entries()) {
      // Replace in headings
      const rankPattern = new RegExp(`<h[23][^>]*>\\s*#?${oldRank}\\s+`, 'g');
      newContent = newContent.replace(rankPattern, (match) => {
        return match.replace(`#${oldRank}`, `#${newRank}`).replace(` ${oldRank} `, ` ${newRank} `);
      });
      
      // Replace in product blocks
      const productRankPattern = new RegExp(`<div class="product-rank">#${oldRank}</div>`, 'g');
      newContent = newContent.replace(productRankPattern, `<div class="product-rank">#${newRank}</div>`);
    }
  }
  
  return newContent;
}

/**
 * Ensure product links in content match the heading titles
 */
export function ensureConsistentProductLinks(content: string, products: any[]): string {
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
    const newProductHtml = generateProductHtml(matchedProduct, products.length - bestMatchIndex);
    
    // Replace the old product card with the new one that matches the heading
    newContent = newContent.replace(productCardHtml, newProductHtml);
    console.log(`✅ Updated product link for "${headingText}" to match described product`);
  }
  
  return newContent;
}

/**
 * Clean up duplicate titles and ranking numbers in the content
 * This addresses the issue of repeated product titles and duplicate rank numbers
 */
export function cleanupDuplicateContent(content: string): string {
  console.log('🧹 Cleaning up duplicate titles and ranking numbers');
  
  let cleanedContent = content;
  
  // Fix duplicate ranking numbers (#10, #9, etc.) that appear multiple times
  const rankingPattern = /#(\d{1,2})\s+#\1/g;
  cleanedContent = cleanedContent.replace(rankingPattern, '#$1');
  
  // Find product card blocks
  const productBlockRegex = /<div class="product-card.*?Check Price on Amazon.*?<\/div>\s*<\/div>\s*<\/div>/gs;
  const productBlocks = [...cleanedContent.matchAll(productBlockRegex)];
  
  for (const block of productBlocks) {
    if (!block[0]) continue;
    
    // Extract the product title from this block
    const titleMatch = block[0].match(/<h4 class="[^"]*product-title[^"]*">(.*?)<\/h4>/s);
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      
      // Find if this title appears multiple times in nearby content
      // Create a regex that will match repeated titles around this block
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titlePattern = new RegExp(`${escapedTitle}\\s*${escapedTitle}`, 'g');
      
      // Replace the duplicate titles with a single instance
      const sectionStart = Math.max(0, cleanedContent.indexOf(block[0]) - 500);
      const sectionEnd = Math.min(cleanedContent.length, cleanedContent.indexOf(block[0]) + block[0].length + 500);
      const section = cleanedContent.substring(sectionStart, sectionEnd);
      
      if (titlePattern.test(section)) {
        console.log(`✂️ Found duplicate title: "${title.substring(0, 30)}..."`);
        const fixedSection = section.replace(titlePattern, title);
        cleanedContent = cleanedContent.substring(0, sectionStart) + 
                         fixedSection + 
                         cleanedContent.substring(sectionEnd);
      }
    }
  }
  
  // Clean up any JSON formatting artifacts that shouldn't be visible
  cleanedContent = cleanedContent.replace(/```json\s*\{/g, '');
  cleanedContent = cleanedContent.replace(/\}\s*```/g, '');
  
  // Remove extra blank lines
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');
  
  return cleanedContent;
}

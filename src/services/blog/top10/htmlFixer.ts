/**
 * HTML fixing utilities for Top10 blog posts
 */

/**
 * Fix common HTML issues in blog post content
 */
export function fixHtmlTags(content: string): string {
  console.log('🔧 Fixing HTML tags in content');
  
  if (!content) {
    console.warn('⚠️ Empty content passed to fixHtmlTags');
    return '';
  }
  
  let fixedContent = content;
  
  // Remove JSON formatting artifacts
  fixedContent = fixedContent.replace(/```json\s*\{/g, '');
  fixedContent = fixedContent.replace(/\}\s*```/g, '');
  
  // Remove any raw JSON at the start or end of the content
  if (fixedContent.trim().startsWith('{') && fixedContent.includes('"content":')) {
    try {
      const jsonMatch = fixedContent.match(/\{.*"content":\s*"(.+?)"\s*\}/s);
      if (jsonMatch && jsonMatch[1]) {
        console.log('⚠️ Found JSON wrapper around content, extracting the actual content');
        fixedContent = jsonMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
    } catch (e) {
      console.warn('⚠️ Error attempting to parse JSON wrapper:', e);
    }
  }
  
  // Fix duplicate title issues, where the blog title is repeated multiple times
  const titlePattern = /<h1[^>]*>(.*?)<\/h1>/gi;
  const titles = [...fixedContent.matchAll(titlePattern)];
  if (titles.length > 1) {
    console.log(`⚠️ Found ${titles.length} h1 titles, keeping only the first one`);
    // Keep only the first title
    const firstTitle = titles[0][0];
    // Replace all other titles with empty string
    for (let i = 1; i < titles.length; i++) {
      fixedContent = fixedContent.replace(titles[i][0], '');
    }
  }
  
  // Fix heading tags (h1, h2, h3)
  fixedContent = fixedContent.replace(/<h1([^>]*)>([^<]*?)(?=<(?!\/h1>))/g, '<h1$1>$2</h1>');
  fixedContent = fixedContent.replace(/<h2([^>]*)>([^<]*?)(?=<(?!\/h2>))/g, '<h2$1>$2</h2>');
  fixedContent = fixedContent.replace(/<h3([^>]*)>([^<]*?)(?=<(?!\/h3>))/g, '<h3$1>$2</h3>');
  
  // Fix paragraph tags
  fixedContent = fixedContent.replace(/<p>([^<]*?)(?=<(?!\/p>))/g, '<p>$1</p>');
  
  // Fix unordered list tags
  fixedContent = fixedContent.replace(/<ul([^>]*)>([^<]*?)(?=<(?!\/ul>))/g, '<ul$1>');
  fixedContent = fixedContent.replace(/<\/ul>([^<]*?)(?=<)/g, '</ul>\n\n');
  
  // Fix list items
  fixedContent = fixedContent.replace(/<li>([^<]*?)(?=<(?!\/li>))/g, '<li>$1</li>');
  
  // Remove duplicate content markers e.g. #10 #10
  fixedContent = fixedContent.replace(/#(\d{1,2})\s+#\1/g, '#$1');
  
  // Fix duplicate product titles or headings
  const headingRegex = /(<h[23][^>]*>)([^<]+)<\/h[23]>\s*\1\2<\/h[23]>/g;
  fixedContent = fixedContent.replace(headingRegex, '$1$2</h3>');
  
  // Fix unclosed product card divs
  fixedContent = fixedContent.replace(/<div class="product-card[^>]*>((?:(?!<\/div>).)*?)(?=<div class="product-card)/gs, 
                                    match => match + '</div></div></div>');
  
  // Fix any empty div containers that were broken by AI-generated content
  fixedContent = fixedContent.replace(/<div[^>]*>\s*<\/div[^>]*>\s*<\/div[^>]*>\s*<\/div[^>]*>/g, '</div></div></div>');
  
  // Ensure horizontal rules have proper spacing
  fixedContent = fixedContent.replace(/<hr class="my-8">\s*<hr class="my-8">/g, '<hr class="my-8">');
  
  // Fix double product data placeholders
  fixedContent = fixedContent.replace(/\[PRODUCT_DATA_(\d+)\]\s*\[PRODUCT_DATA_\1\]/g, '[PRODUCT_DATA_$1]');
  
  // Fix duplicate sections with same product
  const productSectionRegex = /(<h3[^>]*>.*?<\/h3>.*?product-card.*?Check Price on Amazon.*?)(\1)/gs;
  fixedContent = fixedContent.replace(productSectionRegex, '$1');
  
  // Remove duplicate H3 headings with same text that appear in sequence
  const duplicateH3Regex = /(<h3[^>]*>)(.*?)<\/h3>(\s*)<h3[^>]*>\2<\/h3>/g;
  fixedContent = fixedContent.replace(duplicateH3Regex, '$1$2</h3>');
  
  // Ensure there are no repeated product entries with the same title
  const productEntries = [...fixedContent.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)];
  const seenTitles = new Set();
  const duplicateTitlePositions = [];
  
  for (const entry of productEntries) {
    const title = entry[1].trim();
    const position = entry.index;
    if (position !== undefined) {
      if (seenTitles.has(title)) {
        duplicateTitlePositions.push(position);
      } else {
        seenTitles.add(title);
      }
    }
  }
  
  // Remove sections with duplicate titles (from end to start to avoid index shifting)
  duplicateTitlePositions.sort((a, b) => b - a);
  for (const position of duplicateTitlePositions) {
    const nextHeadingPos = fixedContent.indexOf('<h3', position + 1);
    const sectionEnd = nextHeadingPos > -1 ? nextHeadingPos : fixedContent.length;
    fixedContent = fixedContent.substring(0, position) + fixedContent.substring(sectionEnd);
  }
  
  // Remove extra blank lines
  fixedContent = fixedContent.replace(/\n{3,}/g, '\n\n');
  
  return fixedContent;
}


/**
 * HTML wrapping utilities for Top10 blog posts
 */

/**
 * Wrap plain text in appropriate HTML tags
 * This is crucial for formatting unstructured content from AI
 */
export function wrapTextInHtml(content: string, title: string): string {
  // If content already has HTML structure, return as is
  if (content.includes('<h1>') || content.includes('<h2>') || content.includes('<p>')) {
    return content;
  }
  
  console.log('🔄 Converting plain text to HTML structure');
  
  // Remove any JSON formatting if present
  let cleanedContent = content;
  if (content.includes('"title"') && content.includes('"content"')) {
    try {
      const jsonObj = JSON.parse(content);
      if (jsonObj.content) {
        cleanedContent = jsonObj.content;
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse JSON content:', e);
    }
  }
  
  // Add title as H1 if not present
  let htmlContent = `<h1 class="text-center mb-8">${title || 'Top 10 Best Lenovo Laptops'}</h1>\n\n`;
  
  // Process paragraphs
  const paragraphs = cleanedContent.split(/\n\s*\n/);
  paragraphs.forEach((para, index) => {
    // Skip empty paragraphs
    if (!para.trim()) return;
    
    // Check if this paragraph contains bullet points
    if (para.includes('✅') || para.includes('•') || para.includes('-') && para.includes('\n')) {
      // This is a list
      const listItems = para.split(/\n/).filter(line => line.trim().length > 0);
      if (listItems.length > 1) {
        htmlContent += '<ul class="my-4">\n';
        listItems.forEach(item => {
          const cleanItem = item.trim().replace(/^[•✅-]\s*/, '');
          if (cleanItem) {
            htmlContent += `<li>${cleanItem}</li>\n`;
          }
        });
        htmlContent += '</ul>\n\n';
        return;
      }
    }
    
    // Check if this looks like a product heading (#1: Lenovo ThinkPad X1)
    if (/^#?\d+[\.:]\s*.+/m.test(para)) {
      const rankMatch = para.match(/^#?(\d+)[\.:]\s*(.+)/m);
      if (rankMatch) {
        const rank = rankMatch[1];
        const productName = rankMatch[2].trim();
        // Only include the product name in the heading, not the full specs
        const simplifiedName = productName.split('|')[0].trim();
        htmlContent += `<h3>#${rank} ${simplifiedName}</h3>\n\n`;
        
        // Add a placeholder for the product data
        htmlContent += `[PRODUCT_DATA_${rank}]\n\n`;
        return;
      }
    }
    
    // Check if this looks like a simple heading (short, ends with no period)
    if (para.length < 80 && !para.trim().endsWith('.') && !para.includes('\n')) {
      // Is this a model name (like "Lenovo ThinkPad X1")?
      if (/Lenovo\s+[\w\s]+(Pro|Slim|Book|X\d|Yoga|Flex|Legion|ThinkPad|IdeaPad)/i.test(para)) {
        htmlContent += `<h3>${para.trim()}</h3>\n\n`;
      } 
      // Is this a numbered heading like "#1: Lenovo ThinkPad"?
      else if (/^#?\d+[\.:]\s*/.test(para) || /^[A-Z][a-z]+\s+\d+:/.test(para)) {
        // Extract just the basic product name without full specs
        const basicName = para.split('|')[0].trim();
        htmlContent += `<h3>${basicName}</h3>\n\n`;
      }
      // General subheading
      else if (index > 0 && para.length < 50) {
        htmlContent += `<h2>${para.trim()}</h2>\n\n`;
      } 
      else {
        htmlContent += `<p>${para.trim()}</p>\n\n`;
      }
    } 
    // For emojis at the start of paragraphs, ensure proper formatting
    else if (/^[😍🚀💡✨🔥👉].+/m.test(para)) {
      htmlContent += `<p>${para.trim()}</p>\n\n`;
    } 
    // Regular paragraph
    else {
      htmlContent += `<p>${para.trim()}</p>\n\n`;
    }
  });
  
  return htmlContent;
}

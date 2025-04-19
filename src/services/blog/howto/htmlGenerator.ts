
/**
 * HTML generation utilities for How-To blog posts
 */

/**
 * Add a video embed placeholder if it doesn't exist
 */
export function addVideoEmbed(content: string): string {
  if (!content) return '';
  
  // Check if content already has a video placeholder
  if (content.includes('<div class="video-placeholder">') || content.includes('window.humixPlayers')) {
    return content;
  }
  
  // Add video placeholder after the first paragraph
  const firstParagraphEnd = content.indexOf('</p>');
  if (firstParagraphEnd !== -1) {
    return content.substring(0, firstParagraphEnd + 4) + 
           '\n<div class="video-placeholder"></div>\n' + 
           content.substring(firstParagraphEnd + 4);
  }
  
  // If no paragraph, add after first heading
  const firstHeadingEnd = content.indexOf('</h1>');
  if (firstHeadingEnd !== -1) {
    return content.substring(0, firstHeadingEnd + 5) + 
           '\n<div class="video-placeholder"></div>\n' + 
           content.substring(firstHeadingEnd + 5);
  }
  
  // Last resort: add at the beginning
  return '<div class="video-placeholder"></div>\n' + content;
}

/**
 * Wrap plain text in HTML tags for better formatting
 */
export function wrapTextInHtml(content: string, title: string): string {
  if (!content) return '';
  
  // Extract title from the content or use provided title
  let contentTitle = title;
  const lines = content.split(/\n+/);
  
  if (lines.length > 0 && lines[0].trim().length > 0) {
    contentTitle = lines[0].trim();
    lines.shift(); // Remove the title line
  }
  
  // Format the title and wrap it in h1
  const formattedHtml = `<h1>${contentTitle}</h1>\n\n`;
  
  // Process the rest of the content
  let inList = false;
  let htmlContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line - close any open list
      if (inList) {
        htmlContent += '</ul>\n';
        inList = false;
      }
      continue;
    }
    
    // Check for headings (lines ending with : or starting with # or all caps)
    if (line.endsWith(':') || line.startsWith('#') || line === line.toUpperCase()) {
      // Close any open list
      if (inList) {
        htmlContent += '</ul>\n';
        inList = false;
      }
      
      const headingText = line.replace(/^#+ /, '').replace(/:$/, '');
      htmlContent += `<h2>${headingText}</h2>\n`;
      continue;
    }
    
    // Check for list items
    if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\.\s/)) {
      const itemContent = line.replace(/^[-*\d.]\s+/, '');
      
      if (!inList) {
        htmlContent += '<ul>\n';
        inList = true;
      }
      
      htmlContent += `<li>${itemContent}</li>\n`;
      continue;
    }
    
    // Regular paragraph
    if (inList) {
      htmlContent += '</ul>\n';
      inList = false;
    }
    
    htmlContent += `<p>${line}</p>\n`;
  }
  
  // Close any open list at the end
  if (inList) {
    htmlContent += '</ul>\n';
  }
  
  return formattedHtml + htmlContent;
}

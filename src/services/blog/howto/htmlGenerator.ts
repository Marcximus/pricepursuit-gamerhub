
/**
 * Various HTML generation utilities for How-To blog content
 */

/**
 * Adds video embed code to content if not already present
 */
export function addVideoEmbed(content: string): string {
  const humixEmbed = `<div class="humixPlayer" id="humixVideo1" data-video-id="5f9f5f9f-9f9f-9f9f-9f9f-9f9f9f9f9f9f"></div>`;
  
  if (!content.includes('humixPlayer') && !content.includes('humixVideo')) {
    return content + `\n<div class="video-container my-8">${humixEmbed}</div>\n`;
  }
  
  return content;
}

/**
 * Wrap text in HTML with proper structure
 */
export function wrapTextInHtml(content: string, title: string): string {
  if (!content) return '';
  
  // Split the content into sections based on line breaks
  const lines = content.trim().split('\n');
  let htmlContent = '';
  
  // Add title as H1 if not already present and title is provided
  if (!content.includes('<h1>') && title) {
    htmlContent = `<h1>${title}</h1>\n`;
  }
  
  let inList = false;
  let inCodeBlock = false;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) {
      // Add a small spacer for empty lines
      htmlContent += '<div class="spacer"></div>\n';
      continue;
    }
    
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        htmlContent += '</pre>\n';
        inCodeBlock = false;
      } else {
        htmlContent += '<pre><code>\n';
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      htmlContent += line + '\n';
      continue;
    }
    
    // Skip if line already has HTML tags
    if (line.startsWith('<') && line.endsWith('>')) {
      htmlContent += line + '\n';
      continue;
    }
    
    // Handle bullet lists
    if (line.match(/^[\*\-]\s/) || line.match(/^\d+\.\s/)) {
      if (!inList) {
        const isNumbered = line.match(/^\d+\.\s/) !== null;
        htmlContent += `<${isNumbered ? 'ol' : 'ul'}>\n`;
        inList = true;
      }
      
      // Extract the text after the bullet or number
      const listText = line.replace(/^[\*\-]\s|\d+\.\s/, '');
      htmlContent += `<li>${listText}</li>\n`;
      
      // Check if next line is not a list item
      if (i === lines.length - 1 || 
          (!lines[i + 1].match(/^[\*\-]\s/) && !lines[i + 1].match(/^\d+\.\s/))) {
        htmlContent += `</${line.match(/^\d+\.\s/) ? 'ol' : 'ul'}>\n`;
        inList = false;
      }
      continue;
    } else if (inList) {
      // Close list if current line is not a list item
      htmlContent += `</ul>\n`;
      inList = false;
    }
    
    // Handle headings and normal text
    if (i === 0 && !htmlContent.includes('<h1>')) {
      // First line becomes H1 if not already set and no title was provided
      htmlContent += `<h1>${line}</h1>\n`;
    } else if (line.length < 80 && (
      line.toLowerCase().startsWith('step ') || 
      line.match(/^\d+\.\s/) || 
      line.toLowerCase().includes('how to')
    )) {
      // Lines that start with "Step X" or "X." or contain "how to" become H2
      htmlContent += `<h2>${line}</h2>\n`;
    } else if (line.endsWith('?') && line.length < 100) {
      // Questions become H3
      htmlContent += `<h3>${line}</h3>\n`;
    } else {
      // Normal text becomes paragraphs
      htmlContent += `<p>${line}</p>\n`;
    }
  }
  
  // Close any open tags
  if (inList) {
    htmlContent += '</ul>\n';
  }
  if (inCodeBlock) {
    htmlContent += '</pre>\n';
  }
  
  return htmlContent;
}

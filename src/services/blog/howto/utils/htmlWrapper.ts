
/**
 * Wrap content in HTML tags and ensure proper formatting
 */
export function wrapContentInHtml(content: string): string {
  if (!content) return '';
  
  // Check if content already has proper HTML structure
  if (!content.includes('<p>') && !content.includes('<h2>') && !content.includes('<h3>')) {
    // If no HTML structure, wrap each line in paragraph tags
    const lines = content.trim().split('\n');
    content = lines.map(line => {
      line = line.trim();
      if (!line) return '';
      
      // Skip wrapping if line already has HTML tags
      if (line.startsWith('<') && line.endsWith('>')) return line;
      
      return `<p>${line}</p>`;
    }).join('\n');
  }
  
  // Add the wrapper class
  return `<div class="how-to-content">${content}</div>`;
}

/**
 * Wrap plain text in HTML with proper headings and paragraphs
 */
export function wrapPlainTextInHtml(content: string, title: string): string {
  if (!content) return '';
  
  // Split the content into lines
  const lines = content.trim().split('\n');
  let formattedContent = '';
  
  // Add title as H1 if not already present
  if (!content.includes('<h1>') && title) {
    formattedContent = `<h1>${title}</h1>\n`;
  }
  
  // Process each line
  lines.forEach(line => {
    line = line.trim();
    if (!line) {
      formattedContent += '\n';
      return;
    }
    
    // Skip if line already has HTML tags
    if (line.startsWith('<') && line.endsWith('>')) {
      formattedContent += line + '\n';
      return;
    }
    
    // Check if line looks like a heading (less than 120 chars and ends with no punctuation or question mark)
    if (line.length < 120 && 
        (line.endsWith('?') || 
         (!line.endsWith('.') && !line.endsWith('!') && !line.endsWith(',') && !line.endsWith(';')))) {
      if (line.toLowerCase().startsWith('step ') || 
          /^\d+\.\s/.test(line) || 
          line.toLowerCase().includes('how to')) {
        formattedContent += `<h2>${line}</h2>\n`;
      } else {
        formattedContent += `<h3>${line}</h3>\n`;
      }
    } else {
      // Wrap normal text in paragraph tags
      formattedContent += `<p>${line}</p>\n`;
    }
  });
  
  return formattedContent;
}

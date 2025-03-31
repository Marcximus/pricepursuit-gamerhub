
/**
 * Content processing utilities for How-To blog posts
 */

/**
 * Clean up content to ensure proper formatting
 */
export function cleanupContent(content: string): string {
  if (!content) return '';
  
  // Remove excess spacing
  let cleaned = content.replace(/\n{3,}/g, '\n\n');
  
  // Fix common HTML issues
  cleaned = cleaned
    // Convert escaped newlines
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    // Fix multiple opening tags
    .replace(/(<h[1-6]>)\s*(<h[1-6]>)/g, '$1')
    // Fix missing closing tags
    .replace(/<(h[1-6])>(.*?)(?!<\/\1>)(<h[1-6]>)/g, '<$1>$2</$1>$3')
    // Ensure proper paragraph spacing
    .replace(/<\/p><p>/g, '</p>\n<p>');
  
  return cleaned;
}

/**
 * Fix common HTML tag issues
 */
export function fixHtmlTags(content: string): string {
  if (!content) return '';
  
  // Replace encoded characters
  let fixed = content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Fix double closing tags
  fixed = fixed
    .replace(/<\/([^>]+)><\/\1>/g, '</$1>')
    .replace(/<\/p><\/p>/g, '</p>')
    .replace(/<\/h[1-6]><\/h[1-6]>/g, '</h$1>');
  
  // Fix unclosed tags
  const commonTags = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'];
  commonTags.forEach(tag => {
    const openCount = (fixed.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
    const closeCount = (fixed.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    
    if (openCount > closeCount) {
      // Add missing closing tags
      for (let i = 0; i < openCount - closeCount; i++) {
        fixed += `</${tag}>`;
      }
    }
  });
  
  // Convert plain text lists to HTML lists
  if (fixed.includes('- ') || fixed.includes('* ')) {
    const listItemRegex = /^[\s]*[-*]\s+(.+)$/gm;
    if (listItemRegex.test(fixed)) {
      let inList = false;
      const lines = fixed.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^[\s]*[-*]\s+/)) {
          const itemContent = line.replace(/^[\s]*[-*]\s+/, '');
          if (!inList) {
            lines[i] = `<ul>\n<li>${itemContent}</li>`;
            inList = true;
          } else {
            lines[i] = `<li>${itemContent}</li>`;
          }
        } else if (inList && line.trim() !== '') {
          lines[i-1] = lines[i-1] + '</ul>';
          inList = false;
        }
      }
      if (inList) {
        lines.push('</ul>');
      }
      fixed = lines.join('\n');
    }
  }
  
  return fixed;
}

/**
 * Format tables in content
 */
export function formatTables(content: string): string {
  if (!content) return '';
  
  // Check for tab-delimited tables
  if (content.includes('\t')) {
    const tableRegex = /(?:^|\n)([^\t\n]+(?:\t[^\t\n]+)+)(?:\n([^\t\n]+(?:\t[^\t\n]+)+))+/g;
    content = content.replace(tableRegex, (match) => {
      const rows = match.split('\n').filter(row => row.includes('\t'));
      
      let tableHtml = '<table class="w-full border-collapse border border-gray-300 my-4">';
      
      // First row as header
      const headers = rows[0].split('\t');
      tableHtml += '<thead><tr>';
      headers.forEach(header => {
        tableHtml += `<th class="border border-gray-300 px-4 py-2">${header.trim()}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      // Data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('\t');
        tableHtml += '<tr>';
        cells.forEach(cell => {
          tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
        });
        tableHtml += '</tr>';
      }
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
  }
  
  // Check for markdown-style tables with pipe characters
  if (content.includes('|')) {
    const tableRegex = /(?:^|\n)([^\|\n]+\|[^\|\n]+)(?:\n[-\|: ]+)?(?:\n([^\|\n]+\|[^\|\n]+))+/g;
    content = content.replace(tableRegex, (match) => {
      const rows = match.split('\n').filter(row => row.includes('|') && !row.match(/^[-\|: ]+$/));
      
      let tableHtml = '<table class="w-full border-collapse border border-gray-300 my-4">';
      
      // First row as header
      const headers = rows[0].split('|').filter(cell => cell.trim().length > 0);
      tableHtml += '<thead><tr>';
      headers.forEach(header => {
        tableHtml += `<th class="border border-gray-300 px-4 py-2">${header.trim()}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      
      // Data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('|').filter(cell => cell.trim().length > 0);
        tableHtml += '<tr>';
        cells.forEach(cell => {
          tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
        });
        tableHtml += '</tr>';
      }
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
  }
  
  return content;
}

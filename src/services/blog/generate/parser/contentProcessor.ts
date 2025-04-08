
/**
 * Specialized module for processing and formatting content
 */

/**
 * Process content for proper HTML rendering
 */
export function processContent(content: string): string {
  // Remove any escaped newlines and replace with proper HTML
  let processedContent = content
    .replace(/\\n\\n/g, '\n\n')
    .replace(/\\n/g, '\n')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n([^<])/g, '<br/>$1');
  
  // Ensure proper HTML structure with tags
  if (!processedContent.includes('<h1>') && !processedContent.includes('<h2>')) {
    // If no heading tags, wrap content in proper HTML structure
    const lines = processedContent.split(/\n\n|\r\n\r\n/);
    if (lines.length > 1) {
      const title = lines[0];
      const rest = lines.slice(1).join('\n\n');
      processedContent = `<h1>${title}</h1><p>${rest}</p>`;
    }
  }
  
  // Fix table formatting issues - common in How-To blogs
  if (processedContent.includes('Term') && processedContent.includes('What It Means')) {
    console.log('🔍 Detected table structure, fixing formatting...');
    // Extract table data
    const tableMatch = processedContent.match(/Term([\s\S]*?)(?=<\/p>|<h2>|$)/);
    if (tableMatch) {
      const tableText = tableMatch[0];
      // Create proper HTML table
      const rows = tableText.split('\n').filter(line => line.trim().length > 0);
      let htmlTable = '<table class="w-full border-collapse border border-gray-300 my-4"><thead><tr>';
      
      // Process header row
      const headers = rows[0].split('\t').map(h => h.trim());
      headers.forEach(header => {
        htmlTable += `<th class="border border-gray-300 px-4 py-2">${header}</th>`;
      });
      htmlTable += '</tr></thead><tbody>';
      
      // Process data rows
      for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].split('\t').map(c => c.trim());
        htmlTable += '<tr>';
        cells.forEach(cell => {
          htmlTable += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`;
        });
        htmlTable += '</tr>';
      }
      htmlTable += '</tbody></table>';
      
      // Replace the text table with HTML table
      processedContent = processedContent.replace(tableText, htmlTable);
    }
  }
  
  // Fix image placeholders for How-To blogs
  processedContent = processedContent
    .replace(/Image (\d+)/g, '<div class="image-placeholder"></div>')
    .replace(/\[Image (\d+)\]/g, '<div class="image-placeholder"></div>');
    
  // Log content length for debugging
  console.log('📄 Final content length after processing:', processedContent.length, 'characters');
  
  return processedContent;
}


/**
 * Content cleaning utilities for Top10 blog posts
 */

/**
 * Clean up AI-generated content by fixing common issues with HTML structure
 * @param content The original content to clean
 * @returns Cleaned content with better HTML structure
 */
export function cleanupContent(content: string): string {
  console.log('🧹 Cleaning up Top10 content...');
  
  // Remove any doubled-up HTML tags
  let cleaned = content
    .replace(/<p><p>/g, '<p>')
    .replace(/<\/p><\/p>/g, '</p>')
    .replace(/<h1><h1>/g, '<h1>')
    .replace(/<\/h1><\/h1>/g, '</h1>')
    .replace(/<h3><h3>/g, '<h3>')
    .replace(/<\/h3><\/h3>/g, '</h3>')
    .replace(/<h2><h2>/g, '<h2>')
    .replace(/<\/h2><\/h2>/g, '</h2>');
  
  // Fix empty heading tags
  cleaned = cleaned.replace(/<h1>\s*<\/h1>/g, '<h1>Top 10 Best Lenovo Laptops</h1>');
  
  // Ensure proper paragraph formatting
  cleaned = cleaned.replace(/(<\/p>)([^<>\n])/g, '$1\n\n$2');
  cleaned = cleaned.replace(/([^<>\n])(<h[1-6])/g, '$1\n\n$2');
  
  // Ensure emoji separated from text
  cleaned = cleaned.replace(/([\uD800-\uDBFF][\uDC00-\uDFFF])\s*([A-Za-z])/g, '$1 $2');
  
  // Convert plain text bullet points to HTML lists
  cleaned = processBulletPoints(cleaned);
  
  // Handle emoji-prefixed paragraphs (common in AI-generated content)
  cleaned = cleaned.replace(/^(😍|🚀|💡|✨|🔥|👉)(.+)$/gm, '<p>$1 $2</p>');
  
  // Ensure paragraphs are properly wrapped
  cleaned = ensureParagraphWrapping(cleaned);
  
  console.log('✅ Content cleaned successfully');
  return cleaned;
}

/**
 * Process bullet points and convert them to HTML lists
 * @param content Content with potential bullet points
 * @returns Content with bullet points converted to HTML lists
 */
function processBulletPoints(content: string): string {
  const bulletPointRegex = /^[•✅-]\s+(.+)$/gm;
  if (bulletPointRegex.test(content)) {
    let inList = false;
    const lines = content.split('\n');
    let result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBullet = /^[•✅-]\s+/.test(line);
      
      if (isBullet) {
        if (!inList) {
          result.push('<ul class="my-4">');
          inList = true;
        }
        
        const cleanLine = line.replace(/^[•✅-]\s+/, '');
        result.push(`  <li>${cleanLine}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        
        result.push(line);
      }
    }
    
    if (inList) {
      result.push('</ul>');
    }
    
    return result.join('\n');
  }
  
  return content;
}

/**
 * Ensure that text content is properly wrapped in paragraph tags
 * @param content The content to check and fix
 * @returns Content with proper paragraph wrapping
 */
function ensureParagraphWrapping(content: string): string {
  const lines = content.split('\n');
  let result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines or lines that already have HTML
    if (!line || line.startsWith('<') || line.endsWith('>')) {
      result.push(lines[i]);
      continue;
    }
    
    // If this is a standalone text line not wrapped in tags
    // and it's not immediately after an opening tag or before a closing tag
    const prevLine = i > 0 ? lines[i-1].trim() : '';
    const nextLine = i < lines.length - 1 ? lines[i+1].trim() : '';
    
    const isPrevLineOpeningTag = prevLine.endsWith('>') && !prevLine.startsWith('</');
    const isNextLineClosingTag = nextLine.startsWith('</');
    
    if (!isPrevLineOpeningTag && !isNextLineClosingTag && line.length > 10) {
      result.push(`<p>${line}</p>`);
    } else {
      result.push(lines[i]);
    }
  }
  
  return result.join('\n');
}

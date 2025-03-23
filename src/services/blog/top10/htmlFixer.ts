
/**
 * HTML fixing utilities for Top10 blog posts
 */

/**
 * Fix malformed HTML tags in AI-generated content
 * @param content The content with potential HTML issues
 * @returns Content with fixed HTML structure
 */
export function fixHtmlTags(content: string): string {
  console.log('🔧 Fixing HTML tags in content...');
  
  let fixed = content;
  
  // Wrap text that doesn't have tags
  // First, find all text nodes that aren't inside a tag
  fixed = wrapUntaggedContent(fixed);
  
  // Make sure headings have proper spacing
  fixed = fixed.replace(/<(h[1-6])>\s*(.+?)\s*<\/(h[1-6])>/g, '<$1>$2</$3>\n\n');
  
  // Fix unclosed tags
  fixed = fixUnclosedTags(fixed);
  
  // Remove any visible HTML tags in text
  fixed = fixed.replace(/&lt;[^&]*&gt;/g, '');
  
  // Add proper spacing between sections
  fixed = addProperSpacing(fixed);
  
  // Ensure proper newlines between elements
  fixed = fixed.replace(/>\s*</g, '>\n<');
  
  // Finally, clean up any excessive newlines
  fixed = fixed.replace(/\n{3,}/g, '\n\n');
  
  console.log('✅ HTML tags fixed successfully');
  return fixed;
}

/**
 * Wrap content that doesn't have HTML tags
 * @param content The content to check and fix
 * @returns Content with proper HTML wrapping
 */
function wrapUntaggedContent(content: string): string {
  const paragraphs = content.split(/\n{2,}/);
  let newContent = [];
  
  for (let paragraph of paragraphs) {
    // Skip if empty
    if (!paragraph.trim()) continue;
    
    // Skip if it's already an HTML tag
    if (paragraph.trim().startsWith('<') && paragraph.trim().endsWith('>')) {
      newContent.push(paragraph);
      continue;
    }
    
    // If has bullet points, convert to list
    if (/^[•✅-]\s+/m.test(paragraph)) {
      const items = paragraph.split(/\n/).filter(item => /^[•✅-]\s+/.test(item));
      if (items.length > 0) {
        let list = '<ul class="my-4">\n';
        for (const item of items) {
          const cleanItem = item.replace(/^[•✅-]\s+/, '');
          list += `  <li>${cleanItem}</li>\n`;
        }
        list += '</ul>';
        newContent.push(list);
        continue;
      }
    }
    
    // Determine if it's a heading or paragraph
    newContent.push(determineContentType(paragraph));
  }
  
  return newContent.join('\n\n');
}

/**
 * Determine the content type based on its characteristics
 * @param content The content to analyze
 * @returns Properly tagged content
 */
function determineContentType(content: string): string {
  // If it looks like a heading (short and doesn't end with period)
  if (content.length < 80 && !content.trim().endsWith('.') && !content.includes('\n')) {
    // Check if it mentions a Lenovo model
    if (/Lenovo\s+[\w\s]+(Pro|Slim|Book|X\d|Yoga|Flex|Legion|ThinkPad|IdeaPad)/i.test(content)) {
      return `<h3>${content.trim()}</h3>`;
    } 
    // Is this a numbered heading?
    else if (/^#?\d+[\.:]\s*/.test(content)) {
      return `<h3>${content.trim()}</h3>`;
    }
    // General subheading
    else if (content.length < 50) {
      return `<h2>${content.trim()}</h2>`;
    } 
    else {
      return `<p>${content.trim()}</p>`;
    }
  } 
  // Emoji-prefixed paragraph
  else if (/^[😍🚀💡✨🔥👉].+/m.test(content)) {
    return `<p>${content.trim()}</p>`;
  } 
  // Regular paragraph
  else {
    return `<p>${content.trim()}</p>`;
  }
}

/**
 * Fix unclosed HTML tags
 * @param content The content to check for unclosed tags
 * @returns Content with balanced tags
 */
function fixUnclosedTags(content: string): string {
  let fixed = content;
  const commonTags = ['p', 'h1', 'h2', 'h3', 'h4', 'ul', 'li', 'div', 'span'];
  
  commonTags.forEach(tag => {
    // Count opening and closing tags
    const openCount = (fixed.match(new RegExp(`<${tag}[^>]*>`, 'g')) || []).length;
    const closeCount = (fixed.match(new RegExp(`<\\/${tag}>`, 'g')) || []).length;
    
    console.log(`📊 Tag <${tag}>: ${openCount} opening, ${closeCount} closing`);
    
    // Fix if imbalanced
    if (openCount > closeCount) {
      console.log(`⚠️ Fixing unclosed <${tag}> tags`);
      const diff = openCount - closeCount;
      for (let i = 0; i < diff; i++) {
        fixed += `</${tag}>`;
      }
    }
  });
  
  return fixed;
}

/**
 * Add proper spacing between HTML elements
 * @param content The content to add spacing to
 * @returns Content with proper spacing
 */
function addProperSpacing(content: string): string {
  let fixed = content;
  
  fixed = fixed.replace(/<\/h1>\s*/g, '</h1>\n\n');
  fixed = fixed.replace(/<\/h2>\s*/g, '</h2>\n\n');
  fixed = fixed.replace(/<\/h3>\s*(<div)/g, '</h3>\n\n$1');
  fixed = fixed.replace(/<\/h3>\s*([^<\n])/g, '</h3>\n\n<p>$1</p>');
  fixed = fixed.replace(/<\/p>\s*/g, '</p>\n\n');
  fixed = fixed.replace(/<\/ul>\s*([^<\n])/g, '</ul>\n\n<p>$1</p>');
  
  return fixed;
}


/**
 * Specialized JSON parser with robust error handling
 */

/**
 * Parse a potentially malformed JSON string with robust error handling
 */
export function parseJsonResponse(responseText: string): any {
  // Remove non-printable control characters that could break JSON parsing
  const cleanedText = cleanControlCharacters(responseText);
  
  try {
    // First try: direct JSON parsing
    return JSON.parse(cleanedText);
  } catch (error) {
    console.warn('⚠️ Direct JSON parsing failed, trying to extract JSON object');
    
    try {
      // Second try: extract JSON object using regex
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[1]) {
        const extractedJson = jsonMatch[1];
        return JSON.parse(extractedJson);
      }
    } catch (extractError) {
      console.warn('⚠️ JSON extraction failed');
    }
    
    // Third try: handle markdown code blocks with JSON
    try {
      const codeBlockMatch = cleanedText.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
    } catch (codeBlockError) {
      console.warn('⚠️ Code block extraction failed');
    }
    
    // Final attempt: extract individual fields
    const result: any = {};
    
    // Extract title
    const titleMatch = cleanedText.match(/"title"\s*:\s*"([^"]+)"/);
    if (titleMatch) result.title = titleMatch[1];
    
    // Extract content (more complex as it can contain nested quotes)
    const contentStartMatch = cleanedText.match(/"content"\s*:\s*"/);
    if (contentStartMatch) {
      const startIndex = cleanedText.indexOf('"content"') + 11;
      let content = '';
      let inQuote = false;
      let inEscape = false;
      let quoteDepth = 0;
      
      for (let i = startIndex; i < cleanedText.length; i++) {
        const char = cleanedText[i];
        
        if (char === '\\' && !inEscape) {
          inEscape = true;
          content += char;
          continue;
        }
        
        if (char === '"' && !inEscape) {
          if (!inQuote) {
            inQuote = true;
          } else {
            // Check if this is the end quote of the content field
            if (i + 1 < cleanedText.length && 
                (cleanedText[i + 1] === ',' || cleanedText[i + 1] === '}')) {
              break; // End of content field
            }
          }
        }
        
        inEscape = false;
        content += char;
      }
      
      result.content = content.replace(/^"/, '').replace(/\\"/g, '"');
    }
    
    // Extract excerpt
    const excerptMatch = cleanedText.match(/"excerpt"\s*:\s*"([^"]+)"/);
    if (excerptMatch) result.excerpt = excerptMatch[1];
    
    // Extract tags
    const tagsMatch = cleanedText.match(/"tags"\s*:\s*\[(.*?)\]/s);
    if (tagsMatch) {
      const tagsList = tagsMatch[1]
        .split(',')
        .map(tag => tag.trim().replace(/"/g, ''))
        .filter(tag => tag.length > 0);
      result.tags = tagsList;
    }
    
    return result;
  }
}

/**
 * Clean control characters from a string that would break JSON parsing
 */
function cleanControlCharacters(text: string): string {
  // Remove ASCII control characters (0-31) except tabs, newlines, and carriage returns
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    // Handle escaped control characters as well
    .replace(/\\u00([0-1][0-9a-fA-F])/g, ''); 
}

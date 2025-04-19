
/**
 * Process JSON content from How-To blog posts
 */
export function processJsonContent(content: string): string | null {
  try {
    let jsonContent;
    
    // First, clean up HTML tags that might be embedded in the JSON
    const cleanedHtmlContent = content
      .replace(/<br\/>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/<[^>]*>/g, '');
    
    try {
      // Try to parse the cleaned content
      jsonContent = JSON.parse(cleanedHtmlContent);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON pattern
      const jsonMatch = content.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0]
          .replace(/<br\/>/g, '')
          .replace(/&quot;/g, '"')
          .replace(/<[^>]*>/g, '');
        
        try {
          jsonContent = JSON.parse(extractedJson);
        } catch (extractError) {
          console.error('Failed to parse How-To content as JSON:', extractError);
          return null;
        }
      }
    }
    
    if (jsonContent?.content) {
      return jsonContent.content
        .replace(/\\n\\n/g, '\n\n')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'");
    }
  } catch (error) {
    console.error('Error processing JSON content:', error);
  }
  
  return null;
}

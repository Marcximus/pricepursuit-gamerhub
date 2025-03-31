
/**
 * Main processor for How-To content
 */
import { toast } from '@/components/ui/use-toast';
import { 
  cleanupContent, 
  fixHtmlTags,
  formatTables
} from './contentProcessor';
import { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';

/**
 * Process a How-To blog post content by enhancing the structure and formatting
 */
export async function processHowToContent(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processHowToContent');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content ? content.length : 0} characters`);
  console.log(`📄 Content preview (first 200 chars): "${content ? content.substring(0, 200) : 'EMPTY'}..."`);
  
  if (!content || content.trim().length === 0) {
    console.error('❌ CRITICAL ERROR: Received empty content in processHowToContent');
    console.error('⚠️ Prompt was:', prompt);
    toast({
      title: 'Content Processing Error',
      description: 'Received empty content from AI service. Please try again.',
      variant: 'destructive',
    });
    throw new Error('Empty content received from AI service');
  }
  
  try {
    // Remove any JSON formatting that might be causing issues
    let processedContent = removeJsonFormatting(content);
    console.log(`📏 Content after JSON cleanup: ${processedContent.length} characters`);
    
    // Log key markers for debugging content structure
    console.log(`🔍 Content contains <h1> tags: ${processedContent.includes('<h1>')}`);
    console.log(`🔍 Content contains <h2> tags: ${processedContent.includes('<h2>')}`);
    console.log(`🔍 Content contains <p> tags: ${processedContent.includes('<p>')}`);
    console.log(`🔍 Content contains table elements: ${processedContent.includes('<table')}`);
    
    // First, determine if content has proper HTML structure
    const hasHtmlStructure = processedContent.includes('<h1>') || processedContent.includes('<h2>') || 
                            processedContent.includes('<h3>') || 
                            (processedContent.includes('<p>') && processedContent.includes('</p>'));
    
    console.log(`🔍 Content has HTML structure: ${hasHtmlStructure}`);
    
    // If content appears to be plain text, convert it to HTML
    if (!hasHtmlStructure) {
      console.warn('⚠️ Content appears to be plain text, converting to HTML structure');
      processedContent = wrapTextInHtml(processedContent, prompt);
      console.log(`📏 Content after wrapping in HTML: ${processedContent.length} characters`);
    }
    
    // Basic HTML sanity check - add missing header tags if needed
    if (!processedContent.includes('<h1>')) {
      console.warn('⚠️ Content is missing H1 tag, adding title');
      processedContent = `<h1 class="text-center mb-8">${prompt}</h1>\n\n${processedContent}`;
    }
    
    // Clean up the content and fix basic HTML issues
    console.log('🧹 Cleaning up content structure');
    processedContent = cleanupContent(processedContent);
    console.log(`📏 Content length after cleanup: ${processedContent.length} characters`);
    
    // Fix any malformed HTML tags from AI response
    console.log('🔧 Fixing HTML tags');
    processedContent = fixHtmlTags(processedContent);
    console.log(`📏 Content length after fixing HTML tags: ${processedContent.length} characters`);
    
    // Handle tables (common in How-To guides)
    if (processedContent.includes('\t') || processedContent.includes('|')) {
      console.log('🔧 Formatting potential tables');
      processedContent = formatTables(processedContent);
      console.log(`📏 Content length after table formatting: ${processedContent.length} characters`);
    }
    
    // Add Humix video embed if not already present
    processedContent = addVideoEmbed(processedContent);
    console.log(`📏 Content length after adding video embed: ${processedContent.length} characters`);
    
    // Fix image placeholders
    processedContent = processedContent
      .replace(/Image (\d+)/g, '<div class="image-placeholder"></div>')
      .replace(/\[Image (\d+)\]/g, '<div class="image-placeholder"></div>')
      .replace(/image-placeholder" id="image-\d+"><p>Image \d+:[^<]*<\/p>/g, 'image-placeholder">');
    
    // Final sanity check to make sure the HTML is valid - run the fix a second time
    const finalContent = fixHtmlTags(processedContent);
    console.log(`📏 Content length after final HTML fixing: ${finalContent.length} characters`);
    
    // Final log before returning
    console.log(`📤 Final content character count: ${finalContent.length}`);
    console.log(`📤 Final content has proper HTML: ${finalContent.includes('<h1>') && finalContent.includes('<p>')}`);
    
    if (finalContent.length === 0) {
      console.error('❌ EMERGENCY: Final content is still empty!');
      throw new Error('Content processing resulted in empty content');
    }
    
    return finalContent;
  } catch (error) {
    console.error('💥 Error in processHowToContent:', error);
    console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    toast({
      title: 'Error processing content',
      description: error instanceof Error ? error.message : 'Failed to process How-To content',
      variant: 'destructive',
    });
    
    throw error; // Rethrow the error instead of providing fallback content
  }
}

/**
 * Removes JSON formatting from content
 */
function removeJsonFormatting(content: string): string {
  if (!content) return '';
  
  console.log('🔍 Checking for JSON formatting in content...');
  
  // Check if the content is wrapped in JSON format with ```json
  if (content.includes('```json')) {
    console.log('⚠️ Content contains ```json markers, removing...');
    content = content.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
  }
  
  // Check if content is a stringified JSON object
  if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
    try {
      const jsonObj = JSON.parse(content);
      console.log('⚠️ Content is a JSON object, extracting content field...');
      
      if (jsonObj.content) {
        return jsonObj.content;
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse as JSON:', e);
    }
  }
  
  return content;
}

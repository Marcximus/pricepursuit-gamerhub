
/**
 * Main processor for Top10 content
 */
import { toast } from '@/components/ui/use-toast';
import { getProducts } from './productHandler';
import { cleanupContent, fixHtmlTags, replaceProductPlaceholders } from './contentProcessor';
import { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';

/**
 * Process a Top10 blog post content by inserting product data and enhancing the content
 */
export async function processTop10Content(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processTop10Content');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content.length} characters`);
  
  try {
    // First, determine if content has proper HTML structure
    const hasHtmlStructure = content.includes('<h1>') || content.includes('<h2>') || content.includes('<h3>') || 
                            (content.includes('<p>') && content.includes('</p>'));
    
    console.log(`🔍 Content has HTML structure: ${hasHtmlStructure}`);
    
    // If content appears to be plain text, convert it to HTML
    if (!hasHtmlStructure) {
      console.warn('⚠️ Content appears to be plain text, converting to HTML structure');
      content = wrapTextInHtml(content, prompt);
      console.log(`📏 Content after wrapping in HTML: ${content.length} characters`);
    }
    
    // Basic HTML sanity check - add missing header tags if needed
    if (!content.includes('<h1>')) {
      console.warn('⚠️ Content is missing H1 tag, adding title');
      content = `<h1>${prompt}</h1>\n\n${content}`;
    }
    
    // Get products either from localStorage or by fetching them
    const products = await getProducts(prompt);
    
    // If we still don't have products, continue with the content as is
    if (!products || products.length === 0) {
      console.warn('⚠️ No Amazon products found, proceeding with original content');
      toast({
        title: 'No products found',
        description: 'We couldn\'t find any products matching your criteria for the Top 10 post',
        variant: 'default',
      });
      // At least fix HTML tags even without products
      return fixHtmlTags(cleanupContent(content)); 
    }
    
    console.log(`✅ Successfully fetched ${products.length} products from Amazon`);
    if (products.length > 0) {
      console.log(`🔍 First product: "${products[0]?.title?.substring(0, 30) || 'Unknown'}..."`);
      console.log(`First product has HTML content: ${!!products[0]?.htmlContent}`);
    }
    
    // First, clean up the content and fix basic HTML issues
    console.log('🧹 Cleaning up content structure');
    let processedContent = cleanupContent(content);
    
    // Fix any malformed HTML tags from AI response
    console.log('🔧 Fixing HTML tags');
    processedContent = fixHtmlTags(processedContent);
    
    // Replace the product data placeholders with actual data
    console.log('🔄 Replacing product data placeholders in content...');
    const { content: updatedContent, replacementsCount } = replaceProductPlaceholders(
      processedContent,
      products
    );
    processedContent = updatedContent;
    
    // Add Humix video embed if not already present
    processedContent = addVideoEmbed(processedContent);
    
    console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
    console.log(`📏 Content length after processing: ${processedContent.length} characters`);
    
    if (replacementsCount === 0) {
      console.warn('⚠️ No product placeholders were replaced in the content');
      
      // If no placeholders were found, we'll check the content for any mentions of product data
      if (content.includes('[PRODUCT_DATA_')) {
        console.log('🔍 Found placeholder patterns but couldn\'t replace them');
      } else {
        console.warn('⚠️ No placeholder patterns found in content at all');
      }
    }
    
    // Final sanity check to make sure the HTML is valid - run the fix a second time
    // This is crucial for ensuring all content has proper HTML structure
    const finalContent = fixHtmlTags(processedContent);
    
    // Convert any remaining non-HTML text to paragraphs
    let enhancedContent = finalContent;
    
    // If there are no paragraph tags, something went wrong with the HTML processing
    if (!enhancedContent.includes('<p>')) {
      console.warn('⚠️ No paragraph tags found in processed content, attempting emergency fix');
      enhancedContent = wrapTextInHtml(enhancedContent, prompt);
    }
    
    // Final log before returning
    console.log(`📤 Final content character count: ${enhancedContent.length}`);
    console.log(`📤 Final content has proper HTML: ${enhancedContent.includes('<h1>') && enhancedContent.includes('<p>')}`);
    
    return enhancedContent;
  } catch (error) {
    console.error('💥 Error in processTop10Content:', error);
    console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    toast({
      title: 'Error processing content',
      description: error instanceof Error ? error.message : 'Failed to process Top 10 content',
      variant: 'destructive',
    });
    
    // Even if we encounter an error, try to at least fix the HTML tags
    try {
      // Attempt to wrap in HTML if the content seems to be plain text
      if (!content.includes('<h1>') && !content.includes('<p>')) {
        return fixHtmlTags(wrapTextInHtml(content, prompt));
      }
      return fixHtmlTags(content);
    } catch (fallbackError) {
      console.error('💥 Error in emergency fallback:', fallbackError);
      // If everything fails, return the content with basic HTML wrapping
      return `<h1>${prompt}</h1><p>${content}</p>`;
    }
  }
}

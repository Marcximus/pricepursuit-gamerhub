
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
  console.log(`📄 Content length before processing: ${content ? content.length : 0} characters`);
  console.log(`📄 Content preview (first 200 chars): "${content ? content.substring(0, 200) : 'EMPTY'}..."`);
  console.log(`📄 Content preview (last 200 chars): "${content ? '...' + content.substring(content.length - 200) : 'EMPTY'}"`);
  
  if (!content || content.trim().length === 0) {
    console.error('❌ CRITICAL ERROR: Received empty content in processTop10Content');
    console.error('⚠️ Prompt was:', prompt);
    toast({
      title: 'Content Processing Error',
      description: 'Received empty content from AI service. Please try again.',
      variant: 'destructive',
    });
    throw new Error('Empty content received from AI service');
  }
  
  try {
    // Log key markers for debugging content structure
    console.log(`🔍 Content contains <h1> tags: ${content.includes('<h1>')}`);
    console.log(`🔍 Content contains <h2> tags: ${content.includes('<h2>')}`);
    console.log(`🔍 Content contains <p> tags: ${content.includes('<p>')}`);
    console.log(`🔍 Content contains [PRODUCT_DATA_ markers: ${content.includes('[PRODUCT_DATA_')}`);
    
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
    console.log('🛒 Attempting to get product data...');
    const products = await getProducts(prompt);
    console.log(`🛒 getProducts returned ${products?.length || 0} products`);
    
    // If we have products, log some info about the first product
    if (products && products.length > 0) {
      console.log(`✅ Successfully fetched ${products.length} products for Top10 post`);
      console.log(`🔍 First product: "${products[0]?.title?.substring(0, 30) || 'Unknown'}..."`);
      console.log(`First product has HTML content: ${!!products[0]?.htmlContent}`);
      console.log(`First product ASIN: ${products[0]?.asin || 'Unknown'}`);
      
      // Check key fields on all products
      const productsWithHtml = products.filter(p => !!p.htmlContent).length;
      const productsWithAsin = products.filter(p => !!p.asin).length;
      const productsWithTitle = products.filter(p => !!p.title).length;
      
      console.log(`📊 Products with HTML content: ${productsWithHtml}/${products.length}`);
      console.log(`📊 Products with ASIN: ${productsWithAsin}/${products.length}`);
      console.log(`📊 Products with title: ${productsWithTitle}/${products.length}`);
    } else {
      console.error('⚠️ No Amazon products found, cannot proceed without products');
      toast({
        title: 'No products found',
        description: 'We couldn\'t find any products matching your criteria for the Top 10 post',
        variant: 'destructive',
      });
      throw new Error('No product data available for processing Top10 content');
    }
    
    // First, clean up the content and fix basic HTML issues
    console.log('🧹 Cleaning up content structure');
    let processedContent = cleanupContent(content);
    console.log(`📏 Content length after cleanup: ${processedContent.length} characters`);
    
    // Fix any malformed HTML tags from AI response
    console.log('🔧 Fixing HTML tags');
    processedContent = fixHtmlTags(processedContent);
    console.log(`📏 Content length after fixing HTML tags: ${processedContent.length} characters`);
    
    // Check if the content already has product data embedded directly by DeepSeek
    const hasEmbeddedProducts = processedContent.includes('product-card') || 
                                processedContent.includes('asin=') || 
                                processedContent.includes('amazon.com');
    
    console.log(`🔍 Content has embedded product cards/links: ${hasEmbeddedProducts}`);
    
    // Replace the product data placeholders with actual data if needed
    if (processedContent.includes('[PRODUCT_DATA_') || !hasEmbeddedProducts) {
      console.log('🔄 Replacing product data placeholders in content...');
      const { content: updatedContent, replacementsCount } = replaceProductPlaceholders(
        processedContent,
        products
      );
      processedContent = updatedContent;
      console.log(`📏 Content length after replacing placeholders: ${processedContent.length} characters`);
      console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
      
      if (replacementsCount === 0 && !hasEmbeddedProducts) {
        console.warn('⚠️ No product placeholders were replaced in the content');
        throw new Error('DeepSeek did not include product placeholders or embed products directly in the HTML');
      }
    } else {
      console.log('✅ Content already has embedded product data, skipping placeholder replacement');
    }
    
    // Add Humix video embed if not already present
    processedContent = addVideoEmbed(processedContent);
    console.log(`📏 Content length after adding video embed: ${processedContent.length} characters`);
    
    // Final sanity check to make sure the HTML is valid - run the fix a second time
    // This is crucial for ensuring all content has proper HTML structure
    const finalContent = fixHtmlTags(processedContent);
    console.log(`📏 Content length after final HTML fixing: ${finalContent.length} characters`);
    
    // If there are no paragraph tags, something went wrong with the HTML processing
    if (!finalContent.includes('<p>')) {
      console.warn('⚠️ No paragraph tags found in processed content, this indicates a major issue');
      throw new Error('Generated content has no paragraph tags - invalid HTML structure');
    }
    
    // Final log before returning
    console.log(`📤 Final content character count: ${finalContent.length}`);
    console.log(`📤 Final content has proper HTML: ${finalContent.includes('<h1>') && finalContent.includes('<p>')}`);
    
    if (finalContent.length === 0) {
      console.error('❌ EMERGENCY: Final content is still empty!');
      throw new Error('Content processing resulted in empty content');
    }
    
    return finalContent;
  } catch (error) {
    console.error('💥 Error in processTop10Content:', error);
    console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    toast({
      title: 'Error processing content',
      description: error instanceof Error ? error.message : 'Failed to process Top 10 content',
      variant: 'destructive',
    });
    
    throw error; // Rethrow the error instead of providing fallback content
  }
}


/**
 * Main processor for Top10 content
 */
import { toast } from '@/components/ui/use-toast';
import { getProducts } from './productHandler';
import { cleanupContent, fixHtmlTags, replaceProductPlaceholders } from './contentProcessor';
import { addVideoEmbed, generateProductHtml } from './htmlGenerator';

/**
 * Process a Top10 blog post content by inserting product data and enhancing the content
 */
export async function processTop10Content(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processTop10Content');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content.length} characters`);
  
  try {
    // First, clean up the content - do this before fetching products to ensure clean HTML
    let processedContent = cleanupContent(content);
    
    // Fix any malformed HTML tags from AI response
    processedContent = fixHtmlTags(processedContent);
    
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
      return processedContent; // Already fixed HTML tags above
    }
    
    console.log(`✅ Successfully fetched ${products.length} products from Amazon`);
    if (products.length > 0) {
      console.log(`🔍 First product: "${products[0]?.title?.substring(0, 30) || 'Unknown'}..."`);
      console.log(`First product has HTML content: ${!!products[0]?.htmlContent}`);
    }
    
    // Replace the product data placeholders with actual data
    console.log('🔄 Replacing product data placeholders in content...');
    const { content: updatedContent, replacementsCount } = replaceProductPlaceholders(
      processedContent,
      products
    );
    processedContent = updatedContent;
    
    // Add Humix video embed if not already present
    processedContent = addVideoEmbed(processedContent);
    
    // Final cleanup pass to ensure all HTML is valid
    processedContent = fixHtmlTags(processedContent);
    
    console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
    console.log(`📏 Content length after processing: ${processedContent.length} characters`);
    
    if (replacementsCount === 0) {
      console.warn('⚠️ No product placeholders were replaced in the content');
      
      // If no placeholders were found, we'll check the content for any mentions of product data
      if (content.includes('[PRODUCT_DATA_')) {
        console.log('🔍 Found placeholder patterns but couldn\'t replace them');
        
        // Try a more aggressive approach to insert products if normal method failed
        const h3Tags = processedContent.match(/<h3>.*?<\/h3>/g);
        if (h3Tags && h3Tags.length > 0 && products.length > 0) {
          console.log('🔧 Attempting alternative product insertion method using h3 tags');
          
          // Insert products after each h3 tag
          for (let i = 0; i < Math.min(h3Tags.length, products.length); i++) {
            const productHtml = products[i].htmlContent || generateProductHtml(products[i], i + 1);
            const h3Tag = h3Tags[i];
            processedContent = processedContent.replace(
              h3Tag,
              `${h3Tag}\n${productHtml}\n`
            );
          }
          
          console.log('✅ Alternative product insertion completed');
        }
      } else {
        console.warn('⚠️ No placeholder patterns found in content at all');
      }
    }
    
    return processedContent;
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
    return fixHtmlTags(content);
  }
}

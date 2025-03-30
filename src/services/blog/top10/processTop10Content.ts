
/**
 * Main processor for Top10 content
 */
import { toast } from '@/components/ui/use-toast';
import { getProducts } from './productHandler';
import { 
  cleanupContent, 
  fixHtmlTags, 
  removeJsonFormatting, 
  extractProductSpecs 
} from './contentProcessor';
import { replaceProductPlaceholders, removeDuplicateProductBlocks } from './product/productPlacer';
import { addVideoEmbed, wrapTextInHtml } from './htmlGenerator';

/**
 * Process a Top10 blog post content by inserting product data and enhancing the content
 */
export async function processTop10Content(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processTop10Content');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content ? content.length : 0} characters`);
  console.log(`📄 Content preview (first 200 chars): "${content ? content.substring(0, 200) : 'EMPTY'}..."`);
  
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
    // First, remove any JSON formatting that might be causing issues
    let processedContent = removeJsonFormatting(content);
    console.log(`📏 Content after JSON cleanup: ${processedContent.length} characters`);
    
    // Log key markers for debugging content structure
    console.log(`🔍 Content contains <h1> tags: ${processedContent.includes('<h1>')}`);
    console.log(`🔍 Content contains <h2> tags: ${processedContent.includes('<h2>')}`);
    console.log(`🔍 Content contains <h3> tags: ${processedContent.includes('<h3>')}`);
    console.log(`🔍 Content contains <p> tags: ${processedContent.includes('<p>')}`);
    console.log(`🔍 Content contains [PRODUCT_DATA_ markers: ${processedContent.includes('[PRODUCT_DATA_')}`);
    console.log(`🔍 Content contains "products": [...] array: ${processedContent.includes('"products":')}`);
    console.log(`🔍 Content has embedded product cards/links: ${processedContent.includes('product-card')}`);
    
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
    
    // Preserve the original content to debug the "products" array extraction
    const originalContent = processedContent;
    
    // Extract product specs directly from the content, especially the JSON "products" array
    console.log('🔍 Extracting product specifications from content...');
    const productSpecs = extractProductSpecs(originalContent);
    
    if (productSpecs.length > 0) {
      console.log(`✅ Successfully extracted specifications for ${productSpecs.length} products`);
      console.log(`📊 First product specs:`, productSpecs[0]);
      console.log(`📊 Last product specs:`, productSpecs[productSpecs.length - 1]);
    } else {
      console.warn('⚠️ No product specifications found in content');
      // Look for the products array in the original content for debugging
      console.log('🔍 DEBUG: Looking for "products" array in content:');
      const productsArrayMatch = originalContent.match(/\"products\"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
      if (productsArrayMatch) {
        console.log('🔍 DEBUG: Found "products" array:');
        console.log(productsArrayMatch[1].substring(0, 300) + '...');
      } else {
        console.log('🔍 DEBUG: "products" array not found');
      }
    }
    
    // Get products either from localStorage or by fetching them
    console.log('🛒 Attempting to get product data...');
    const products = await getProducts(prompt);
    console.log(`🛒 getProducts returned ${products?.length || 0} products`);
    
    // Log more info about the products we found
    if (products && products.length > 0) {
      console.log(`🔍 First product: "${products[0].title?.substring(0, 30)}..."`);
      console.log(`First product has HTML content: ${!!products[0].htmlContent}`);
      console.log(`First product ASIN: ${products[0].asin}`);
      console.log(`First product CPU: ${products[0].cpu || products[0].processor || 'Unknown'}`);
      
      const productsWithHtml = products.filter(p => !!p.htmlContent).length;
      const productsWithAsin = products.filter(p => !!p.asin).length;
      const productsWithTitle = products.filter(p => !!p.title).length;
      
      console.log(`📊 Products with HTML content: ${productsWithHtml}/${products.length}`);
      console.log(`📊 Products with ASIN: ${productsWithAsin}/${products.length}`);
      console.log(`📊 Products with title: ${productsWithTitle}/${products.length}`);
    }
    
    // If we have productSpecs from the AI response, merge them with the products data
    let productsToUse = products;
    
    if (productSpecs.length > 0 && products && products.length > 0) {
      console.log('🔄 Merging product specs with product data...');
      productsToUse = products.map((product, index) => {
        // First, try to find the product spec with matching position
        const matchingSpec = productSpecs.find(spec => spec.position === (index + 1));
        
        if (matchingSpec) {
          return {
            ...product,
            cpu: matchingSpec.cpu || product.processor || product.cpu || '',
            processor: matchingSpec.cpu || product.processor || product.cpu || '',
            ram: matchingSpec.ram || product.ram || '',
            graphics: matchingSpec.graphics || product.graphics || '',
            storage: matchingSpec.storage || product.storage || '',
            screen: matchingSpec.screen || product.screen_size || product.screen || '',
            screen_size: matchingSpec.screen || product.screen_size || product.screen || '',
            battery: matchingSpec.battery || product.battery_life || product.battery || '',
            battery_life: matchingSpec.battery || product.battery_life || product.battery || '',
            position: index + 1, // Set position correctly (1-indexed)
          };
        }
        
        // If no matching spec, just ensure position is set correctly
        return {
          ...product,
          position: index + 1
        };
      });
      
      console.log('✅ Successfully merged product specs with product data');
      console.log(`🔍 First merged product: CPU: ${productsToUse[0]?.cpu || 'Unknown'}, RAM: ${productsToUse[0]?.ram || 'Unknown'}`);
    } else if (productSpecs.length > 0) {
      // If we only have product specs but no pre-fetched products
      console.log('🔍 Using extracted product specs directly');
      productsToUse = productSpecs;
    } else if (!products || products.length === 0) {
      console.error('⚠️ No product data available for Top10 post');
      toast({
        title: 'No products found',
        description: 'We couldn\'t find any products for the Top 10 post',
        variant: 'destructive',
      });
      throw new Error('No product data available for processing Top10 content');
    }
    
    // First, clean up the content and fix basic HTML issues
    console.log('🧹 Cleaning up content structure');
    processedContent = cleanupContent(processedContent);
    console.log(`📏 Content length after cleanup: ${processedContent.length} characters`);
    
    // Fix any malformed HTML tags from AI response
    console.log('🔧 Fixing HTML tags');
    processedContent = fixHtmlTags(processedContent);
    console.log(`📏 Content length after fixing HTML tags: ${processedContent.length} characters`);
    
    // Replace the product data placeholders with actual data
    const hasPlaceholders = processedContent.includes('[PRODUCT_DATA_');
    const hasProductCards = processedContent.includes('product-card');
    console.log(`🔍 Content has embedded product cards/links: ${hasProductCards}`);
    
    if (hasPlaceholders) {
      console.log('🔄 Replacing product data placeholders in content...');
      // Count potential placeholders for debugging
      const placeholderMatches = processedContent.match(/\[PRODUCT_DATA_\d+\]/g) || [];
      console.log(`📍 Found ${placeholderMatches.length} potential product placeholders`);
      
      const { content: updatedContent, replacementsCount } = replaceProductPlaceholders(
        processedContent,
        productsToUse
      );
      processedContent = updatedContent;
      console.log(`📏 Content length after replacing placeholders: ${processedContent.length} characters`);
      console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
      
      if (replacementsCount === 0 && hasPlaceholders) {
        console.warn('⚠️ No product placeholders were replaced in the content');
        throw new Error('DeepSeek did not include product placeholders or embed products directly in the HTML');
      }
    } else {
      console.log('⚠️ No placeholders found in content - cannot insert products without modifying the content structure');
      throw new Error('DeepSeek did not include product placeholders in the content');
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

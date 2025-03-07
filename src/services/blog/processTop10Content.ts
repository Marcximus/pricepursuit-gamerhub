
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { extractSearchParamsFromPrompt, fetchAmazonProducts } from './amazonProductService';

export async function processTop10Content(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processTop10Content');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content.length} characters`);
  
  try {
    // Extract search parameters from the prompt
    console.log('🔍 Extracting search parameters from prompt...');
    const searchParams = extractSearchParamsFromPrompt(prompt);
    console.log('🎯 Extracted search parameters:', JSON.stringify(searchParams, null, 2));
    
    // Fetch products from Amazon using RapidAPI
    console.log(`🚀 About to fetch Amazon products with query: "${searchParams.query}"`);
    console.log(`📤 Search parameters being sent to API: ${JSON.stringify(searchParams)}`);
    
    const startTime = performance.now();
    
    try {
      const products = await fetchAmazonProducts(searchParams);
      
      const endTime = performance.now();
      console.log(`⏱️ Amazon products fetch took ${(endTime - startTime).toFixed(2)}ms`);
      
      if (!products || products.length === 0) {
        console.warn('⚠️ No Amazon products found');
        toast({
          title: 'No products found',
          description: 'We couldn\'t find any products matching your criteria for the Top 10 post',
          variant: 'default',
        });
        return content;
      }
      
      console.log(`✅ Successfully fetched ${products.length} products from Amazon`);
      console.log(`🔍 First product: "${products[0].title.substring(0, 30)}..."`);
      console.log(`📥 Sample product data: ${JSON.stringify(products[0]).substring(0, 300)}...`);
      
      // Replace the product data placeholders with actual data
      console.log('🔄 Replacing product data placeholders in content...');
      console.log('📃 Content sample before replacement:', content.substring(0, 200) + '...');
      
      let processedContent = content;
      let replacementsCount = 0;
      
      for (let i = 0; i < Math.min(products.length, 10); i++) {
        const product = products[i];
        const placeholderPattern = `<div class="product-data" data-product-id="${i+1}">[PRODUCT_DATA_${i+1}]</div>`;
        console.log(`🔍 Looking for placeholder: "${placeholderPattern}"`);
        
        const placeholderRegex = new RegExp(placeholderPattern, 'g');
        const matchCount = (processedContent.match(placeholderRegex) || []).length;
        
        if (matchCount > 0) {
          console.log(`🎯 Found ${matchCount} placeholder(s) for product #${i+1}`);
          processedContent = processedContent.replace(placeholderRegex, product.htmlContent);
          replacementsCount++;
        } else {
          console.warn(`⚠️ No placeholder found for product #${i+1}`);
        }
      }
      
      // Add Humix video embed if not already present
      if (!processedContent.includes('humixPlayers')) {
        console.log('📼 Adding Humix video embed to content');
        const videoEmbed = `<div class="video-container my-8"><script data-ezscrex="false" data-cfasync="false">(window.humixPlayers = window.humixPlayers || []).push({target: document.currentScript});</script><script async data-ezscrex="false" data-cfasync="false" src="https://www.humix.com/video.js"></script></div>`;
        
        // Insert after the first h2 or at the end if no h2 is found
        const h2Match = processedContent.match(/<h2[^>]*>.*?<\/h2>/i);
        if (h2Match && h2Match.index) {
          const insertPosition = h2Match.index + h2Match[0].length;
          processedContent = processedContent.substring(0, insertPosition) + 
                            '\n\n' + videoEmbed + '\n\n' + 
                            processedContent.substring(insertPosition);
        } else {
          // Add to the end if no h2 is found
          processedContent += '\n\n' + videoEmbed;
        }
      }
      
      console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
      console.log(`📏 Content length after processing: ${processedContent.length} characters`);
      console.log(`📤 Final content sample: ${processedContent.substring(0, 300)}...`);
      
      if (replacementsCount === 0) {
        console.warn('⚠️ No product placeholders were replaced in the content');
        console.log('📄 Content sample for debugging:', content.substring(0, 500));
        console.log('🔍 Looking for any placeholder pattern in content...');
        const anyPlaceholderMatch = content.match(/\[PRODUCT_DATA_\d+\]/g);
        if (anyPlaceholderMatch) {
          console.log('🔍 Found placeholder patterns:', anyPlaceholderMatch);
        } else {
          console.warn('⚠️ No placeholder patterns found in content at all');
          console.log('📄 Complete content for debugging:', content);
        }
      }
      
      return processedContent;
    } catch (callError) {
      console.error('💥 Exception during Amazon products fetch:', callError);
      console.error('💥 Error details:', callError instanceof Error ? callError.message : String(callError));
      console.error('💥 Error stack:', callError instanceof Error ? callError.stack : 'No stack available');
      toast({
        title: 'Error calling product service',
        description: 'Technical error while fetching products. Please try again.',
        variant: 'destructive',
      });
      return content;
    }
  } catch (error) {
    console.error('💥 Error in processTop10Content:', error);
    console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    toast({
      title: 'Error processing content',
      description: error instanceof Error ? error.message : 'Failed to process Top 10 content',
      variant: 'destructive',
    });
    return content;
  }
}

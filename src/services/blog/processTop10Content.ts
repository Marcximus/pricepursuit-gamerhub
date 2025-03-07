
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
    const extractedParams = extractSearchParamsFromPrompt(prompt);
    console.log('🎯 Extracted search parameters:', JSON.stringify(extractedParams, null, 2));
    
    // First, try to get products from localStorage (fetched earlier)
    let products = [];
    const storedProducts = localStorage.getItem('currentTop10Products');
    
    if (storedProducts) {
      console.log('📦 Found pre-fetched products in localStorage');
      try {
        products = JSON.parse(storedProducts);
        // Clear the storage to avoid using these products for another post
        localStorage.removeItem('currentTop10Products');
      } catch (parseError) {
        console.error('Error parsing stored products:', parseError);
        products = [];
      }
    }
    
    // If no stored products, fetch them now as a fallback
    if (!products || products.length === 0) {
      console.log(`🚀 No pre-fetched products found. Fetching Amazon products with query: "${extractedParams.searchParams.query}"`);
      console.log(`📤 Search parameters being sent to API: ${JSON.stringify(extractedParams.searchParams)}`);
      
      try {
        products = await fetchAmazonProducts(extractedParams);
      } catch (callError) {
        console.error('💥 Exception during Amazon products fetch:', callError);
        toast({
          title: 'Error calling product service',
          description: 'Technical error while fetching products. Please try again.',
          variant: 'destructive',
        });
      }
    }
    
    // If we still don't have products, continue with the content as is
    if (!products || products.length === 0) {
      console.warn('⚠️ No Amazon products found, proceeding with original content');
      toast({
        title: 'No products found',
        description: 'We couldn\'t find any products matching your criteria for the Top 10 post',
        variant: 'default',
      });
      return content;
    }
    
    console.log(`✅ Successfully fetched ${products.length} products from Amazon`);
    if (products.length > 0) {
      console.log(`🔍 First product: "${products[0].title?.substring(0, 30) || 'Unknown'}..."`);
    }
    
    // Replace the product data placeholders with actual data
    console.log('🔄 Replacing product data placeholders in content...');
    
    let processedContent = content;
    let replacementsCount = 0;
    
    // Process both standard div placeholders and raw product data mentions
    for (let i = 0; i < Math.min(products.length, 10); i++) {
      const product = products[i];
      const divPlaceholderPattern = `<div class="product-data" data-product-id="${i+1}">[PRODUCT_DATA_${i+1}]</div>`;
      const rawPlaceholderPattern = `[PRODUCT_DATA_${i+1}]`;
      
      console.log(`🔍 Looking for placeholder: "${divPlaceholderPattern}" or "${rawPlaceholderPattern}"`);
      
      const divPlaceholderRegex = new RegExp(divPlaceholderPattern, 'g');
      const rawPlaceholderRegex = new RegExp(rawPlaceholderPattern, 'g');
      
      const divMatchCount = (processedContent.match(divPlaceholderRegex) || []).length;
      const rawMatchCount = (processedContent.match(rawPlaceholderRegex) || []).length;
      
      if (product && product.htmlContent) {
        // Replace div placeholders
        if (divMatchCount > 0) {
          console.log(`🎯 Found ${divMatchCount} div placeholder(s) for product #${i+1}`);
          processedContent = processedContent.replace(divPlaceholderRegex, product.htmlContent || '');
          replacementsCount += divMatchCount;
        }
        
        // Replace raw text placeholders (not inside div tags)
        if (rawMatchCount > 0) {
          // Use a more complex regex to find raw placeholders not inside div tags
          const standaloneRawRegex = new RegExp(`(?<!<div[^>]*>)${rawPlaceholderPattern}(?!</div>)`, 'g');
          const standaloneMatches = processedContent.match(standaloneRawRegex) || [];
          
          if (standaloneMatches.length > 0) {
            console.log(`🎯 Found ${standaloneMatches.length} standalone raw placeholder(s) for product #${i+1}`);
            processedContent = processedContent.replace(standaloneRawRegex, product.htmlContent || '');
            replacementsCount += standaloneMatches.length;
          }
        }
      } else {
        console.warn(`⚠️ No html content found for product #${i+1}`);
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
    
    if (replacementsCount === 0) {
      console.warn('⚠️ No product placeholders were replaced in the content');
      
      // If no placeholders were found, we'll check the content for any mentions of product data
      const anyPlaceholderMatch = content.match(/\[PRODUCT_DATA_\d+\]/g);
      if (anyPlaceholderMatch) {
        console.log('🔍 Found placeholder patterns:', anyPlaceholderMatch);
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
    return content;
  }
}

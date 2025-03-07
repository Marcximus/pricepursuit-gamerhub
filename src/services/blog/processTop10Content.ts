
import { supabase } from '@/integrations/supabase/client';
import { SearchParam } from './types';
import { extractSearchParams } from './extractSearchParams';
import { toast } from '@/components/ui/use-toast';

export async function processTop10Content(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processTop10Content');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content.length} characters`);
  
  try {
    // Extract search parameters from the prompt
    console.log('🔍 Extracting search parameters from prompt...');
    const searchParams = extractSearchParams(prompt);
    console.log('🎯 Extracted search parameters:', JSON.stringify(searchParams, null, 2));
    
    // Check if we have any valid search parameters
    if (!searchParams || searchParams.length === 0) {
      console.warn('⚠️ No valid search parameters extracted from prompt');
      toast({
        title: "Search parameters missing",
        description: "Couldn't extract valid search parameters from your prompt",
        variant: "destructive",
      });
      return content;
    }
    
    // Fetch products using the edge function
    console.log(`🚀 About to call fetch-top10-products with ${searchParams.length} parameter sets`);
    console.log('📋 Search parameters data being sent:', JSON.stringify({
      searchParams,
      count: 10
    }, null, 2));
    
    const startTime = performance.now();
    
    try {
      console.log('📡 Making supabase.functions.invoke call to fetch-top10-products...');
      const { data, error } = await supabase.functions.invoke('fetch-top10-products', {
        body: {
          searchParams,
          count: 10
        },
      });
      
      const endTime = performance.now();
      console.log(`⏱️ fetch-top10-products call took ${(endTime - startTime).toFixed(2)}ms`);
      
      if (error) {
        console.error('❌ Error fetching products:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        toast({
          title: 'Error fetching products',
          description: error.message || 'Failed to fetch product data for the Top 10 post',
          variant: 'destructive',
        });
        return content;
      }
      
      console.log(`📊 Response data:`, data ? 'Data received' : 'No data');
      if (data) console.log('📊 Response data structure:', Object.keys(data));
      
      if (!data || !data.products || data.products.length === 0) {
        console.warn('⚠️ No products found for the search parameters');
        console.warn('⚠️ Full response:', JSON.stringify(data, null, 2));
        toast({
          title: 'No products found',
          description: 'We couldn\'t find any products matching your criteria for the Top 10 post',
          variant: 'default', // Changed from 'warning' to 'default' as only 'default' and 'destructive' are valid variants
        });
        return content;
      }
      
      console.log(`✅ Successfully fetched ${data.products.length} products`);
      console.log(`🔍 First product: "${data.products[0].title.substring(0, 30)}..."`);
      
      // Replace the product data placeholders with actual data
      console.log('🔄 Replacing product data placeholders in content...');
      console.log('📃 Content sample before replacement:', content.substring(0, 200) + '...');
      
      let processedContent = content;
      let replacementsCount = 0;
      
      for (let i = 0; i < Math.min(data.products.length, 10); i++) {
        const product = data.products[i];
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
      
      console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
      console.log(`📏 Content length after processing: ${processedContent.length} characters`);
      
      if (replacementsCount === 0) {
        console.warn('⚠️ No product placeholders were replaced in the content');
        console.log('📄 Content sample for debugging:', content.substring(0, 500));
        console.log('🔍 Looking for any placeholder pattern in content...');
        const anyPlaceholderMatch = content.match(/\[PRODUCT_DATA_\d+\]/g);
        if (anyPlaceholderMatch) {
          console.log('🔍 Found placeholder patterns:', anyPlaceholderMatch);
        } else {
          console.warn('⚠️ No placeholder patterns found in content at all');
        }
      }
      
      return processedContent;
    } catch (callError) {
      console.error('💥 Exception during fetch-top10-products call:', callError);
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

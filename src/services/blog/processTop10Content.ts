
import { supabase } from '@/integrations/supabase/client';
import { SearchParam } from './types';
import { extractSearchParams } from './extractSearchParams';

export async function processTop10Content(content: string, prompt: string): Promise<string> {
  try {
    // Extract search parameters from the prompt
    const searchParams = extractSearchParams(prompt);
    
    // Fetch products using the edge function
    const { data, error } = await supabase.functions.invoke('fetch-top10-products', {
      body: {
        searchParams,
        count: 10
      },
    });
    
    if (error) {
      console.error('Error fetching products:', error);
      return content;
    }
    
    if (!data || !data.products || data.products.length === 0) {
      console.warn('No products found for the search parameters');
      return content;
    }
    
    // Replace the product data placeholders with actual data
    let processedContent = content;
    
    for (let i = 0; i < Math.min(data.products.length, 10); i++) {
      const product = data.products[i];
      const placeholderRegex = new RegExp(`<div class="product-data" data-product-id="${i+1}">\\[PRODUCT_DATA_${i+1}\\]</div>`, 'g');
      processedContent = processedContent.replace(placeholderRegex, product.htmlContent);
    }
    
    return processedContent;
  } catch (error) {
    console.error('Error processing Top 10 content:', error);
    return content;
  }
}

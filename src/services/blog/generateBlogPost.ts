
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { GeneratedBlogContent, SearchParam } from './types';
import { processTop10Content } from './processTop10Content';
import { extractSearchParamsFromPrompt, fetchAmazonProducts } from './amazonProductService';

export async function generateBlogPost(
  prompt: string,
  category: string,
  asin?: string,
  asin2?: string
): Promise<GeneratedBlogContent | null> {
  try {
    console.log(`🚀 Starting blog post generation for category: ${category}`);
    console.log(`📝 User prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    
    // For Top10 category, we need to fetch Amazon products first
    let products = [];
    if (category === 'Top10') {
      console.log('⭐ Detected Top10 post, extracting search parameters...');
      const extractedParams = extractSearchParamsFromPrompt(prompt);
      console.log('📊 Extracted parameters:', extractedParams);
      
      // Pre-process the content to fetch Amazon products
      console.log('🛒 Fetching Amazon products before generating content...');
      try {
        products = await fetchAmazonProducts(extractedParams);
        console.log(`📦 Fetched ${products.length} products from Amazon API`);
        
        if (products.length === 0) {
          console.warn('⚠️ No products were fetched from Amazon API');
          toast({
            title: 'Product Fetching Warning',
            description: 'No products were found. The blog post may be less specific without product data.',
            variant: 'default',
          });
        } else {
          // Store products in local storage for use after content generation
          console.log('💾 Storing fetched products in localStorage for later use');
          localStorage.setItem('currentTop10Products', JSON.stringify(products));
        }
      } catch (error) {
        console.error('❌ Error fetching Amazon products:', error);
        toast({
          title: 'Product Fetching Error',
          description: 'Could not fetch product data. The blog post will be generated with limited information.',
          variant: 'destructive',
        });
      }
    }

    // Check if we have any products for Top10 posts
    if (category === 'Top10') {
      console.log(`📊 Proceeding with ${products.length} products for Top10 post`);
      if (products.length === 0) {
        console.warn('⚠️ No products available, blog quality may be affected');
      }
    }

    // Now call the Supabase function to generate the blog post
    console.log('🧠 Calling generate-blog-post edge function...');
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
      body: {
        prompt,
        category,
        asin,
        asin2,
        products: category === 'Top10' ? products : undefined // Pass the products to the edge function
      },
    });

    if (error) {
      console.error('❌ Error generating blog post:', error);
      throw new Error(error.message || 'Failed to generate blog post');
    }

    console.log('✅ Blog post generated successfully');
    console.log('🔄 Processing generated content...');

    // For Top 10 posts, process product data placeholders
    if (category === 'Top10' && data && data.content) {
      console.log('🔄 Processing Top10 content with product data...');
      data.content = await processTop10Content(data.content, prompt);
    }

    return data;
  } catch (error) {
    console.error('💥 Error in generateBlogPost:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to generate blog post',
      variant: 'destructive',
    });
    return null;
  }
}


import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { GeneratedBlogContent, SearchParam } from './types';
import { processTop10Content } from './top10';
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
    
    // Verify category matches content type
    // If the prompt seems like a Top10 list but category is different, show a warning
    if (prompt.toLowerCase().includes('top 10') && category !== 'Top10') {
      console.warn('⚠️ Prompt appears to be for a Top10 post, but selected category is:', category);
      toast({
        title: 'Category Mismatch Warning',
        description: 'Your prompt seems to be for a Top10 list. Consider changing the category to "Top10".',
        variant: 'default',
      });
    }
    
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
        console.log(`📦 Fetched ${products?.length || 0} products from Amazon API`);
        
        if (!products || products.length === 0) {
          console.warn('⚠️ No products were fetched from Amazon API');
          toast({
            title: 'Product Fetching Warning',
            description: 'No products were found. The blog post may be less specific without product data.',
            variant: 'default',
          });
        } else {
          // Store products in local storage for use after content generation
          console.log('💾 Storing fetched products in localStorage for later use');
          try {
            localStorage.setItem('currentTop10Products', JSON.stringify(products));
            console.log('✅ Products successfully stored in localStorage');
          } catch (storageError) {
            console.error('❌ Error storing products in localStorage:', storageError);
            console.log('💾 Will continue without localStorage backup');
          }
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
      console.log(`📊 Proceeding with ${products?.length || 0} products for Top10 post`);
      if (!products || products.length === 0) {
        console.warn('⚠️ No products available, blog quality may be affected');
      }
    }

    // Now call the Supabase function to generate the blog post with explicit timeout
    console.log('🧠 Calling generate-blog-post edge function...');
    
    try {
      const response = await supabase.functions.invoke('generate-blog-post', {
        body: {
          prompt,
          category,
          asin,
          asin2,
          products: category === 'Top10' ? products : undefined // Pass the products to the edge function
        },
        // Add a longer timeout for the function call - this is important!
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.error) {
        console.error('❌ Error generating blog post:', response.error);
        throw new Error(response.error.message || 'Failed to generate blog post');
      }

      // Check if response.data exists and is valid
      if (!response.data) {
        console.error('❌ Empty response data from edge function');
        throw new Error('Empty response from edge function');
      }

      console.log('✅ Blog post generated successfully');
      console.log('🔄 Processing generated content...');
      console.log('📦 Response data type:', typeof response.data);
      
      let data: GeneratedBlogContent;
      
      // Handle parsing for both string and object response formats
      if (typeof response.data === 'string') {
        try {
          // Try to parse as JSON if it's a string
          console.log('🔍 Trying to parse string response as JSON');
          data = JSON.parse(response.data);
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          console.error('📄 Raw response data preview:', response.data.substring(0, 200) + '...');
          
          // Create a basic structure with error information
          data = {
            title: `New ${category} Post`,
            content: `Error parsing AI content: ${parseError.message}\n\nOriginal content:\n${response.data}`,
            excerpt: "There was an error generating this post's content.",
            category,
            tags: ['error']
          };
        }
      } else {
        // If it's already an object, use it directly
        console.log('🔍 Response is already an object, using directly');
        data = response.data as GeneratedBlogContent;
      }

      // For Top 10 posts, process product data placeholders
      if (category === 'Top10' && data && data.content) {
        console.log('🔄 Processing Top10 content with product data...');
        data.content = await processTop10Content(data.content, prompt);
      }

      return data;
    } catch (error) {
      console.error('💥 Error in Supabase function invoke:', error);
      toast({
        title: 'Edge Function Error',
        description: 'The blog generation service is currently unavailable. Please try again later.',
        variant: 'destructive',
      });
      throw error; // Re-throw to be caught by the outer try/catch
    }
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

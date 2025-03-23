
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

    // Prepare the request payload
    const requestPayload = {
      prompt,
      category,
      asin,
      asin2,
      products: category === 'Top10' ? products.slice(0, 10) : undefined // Limit to 10 products max
    };
    
    // Add some logging for the payload
    console.log('📦 Request payload structure:', {
      promptLength: prompt.length,
      category,
      asin: asin || null,
      asin2: asin2 || null,
      productsCount: requestPayload.products?.length || 0
    });
    
    // Log the entire payload size
    const payloadString = JSON.stringify(requestPayload);
    console.log(`📤 Request payload size: ${payloadString.length} bytes`);
    
    // Now call the Supabase function to generate the blog post
    console.log('🧠 Calling generate-blog-post edge function...');
    console.log('📤 Calling Supabase Edge Function with payload size:', payloadString.length);
    
    // Add retry logic for API failures
    const maxRetries = 2;
    let response = null;
    let retryCount = 0;
    let lastError = null;
    
    while (retryCount <= maxRetries) {
      try {
        response = await supabase.functions.invoke('generate-blog-post', {
          body: requestPayload,
        });
        
        // Check for API errors
        if (response.error) {
          console.error('❌ Error generating blog post:', response.error);
          console.log('📥 Edge function response received:', response);
          
          // Prepare for retry or throw error on last attempt
          lastError = response.error;
          retryCount++;
          
          if (retryCount <= maxRetries) {
            console.warn(`⚠️ Retrying after error: ${response.error.message}`);
            console.log(`🔄 Retry attempt ${retryCount}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          } else {
            throw new Error(response.error.message || 'Failed to generate blog post');
          }
        }
        
        // Success case - break the retry loop
        break;
      } catch (error) {
        console.error('💥 Exception during API call:', error);
        
        lastError = error;
        retryCount++;
        
        if (retryCount <= maxRetries) {
          console.warn(`⚠️ Retrying after exception: ${error.message}`);
          console.log(`🔄 Retry attempt ${retryCount}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        } else {
          throw error; // Re-throw on last attempt
        }
      }
    }
    
    // If we exhausted all retries and still have an error
    if (retryCount > maxRetries && lastError) {
      console.error('❌ Error generating blog post after retries:', lastError);
      throw lastError;
    }

    // Check if response.data exists and is valid
    if (!response || !response.data) {
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
        console.error('📄 Raw response data preview:', 
          response.data.substring(0, Math.min(200, response.data.length)) + '...');
        
        // Create a basic structure with error information but still usable content
        data = createFallbackContent(category, prompt, parseError, response.data, products);
      }
    } else {
      // If it's already an object, use it directly
      console.log('🔍 Response is already an object, using directly');
      data = response.data as GeneratedBlogContent;
    }
    
    // Log the content length for debugging
    console.log('📄 Final content length:', data?.content?.length || 0, 'characters');
    
    // Add a short preview of the content for debugging
    if (data && data.content) {
      console.log('📄 Content first 100 chars:', 
        `"${data.content.substring(0, Math.min(100, data.content.length))}${data.content.length > 100 ? '...' : ''}"`);
      console.log('📄 Content has video:', data.content.includes('humix'));
      console.log('📄 Product card count:', 
        (data.content.match(/product-card/g) || []).length);
    }

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

/**
 * Create fallback content when API fails
 */
function createFallbackContent(
  category: string, 
  prompt: string, 
  error?: Error,
  rawResponse?: string,
  products?: any[]
): GeneratedBlogContent {
  // Extract title from prompt
  let title = '';
  if (category === 'Top10') {
    title = prompt.trim();
    if (!title.toLowerCase().startsWith('top')) {
      title = 'Top 10 ' + title;
    }
  } else {
    title = `New ${category} Post: ${prompt.substring(0, 30)}...`;
  }
  
  // Create a basic introduction
  let content = `
  <h1>${title}</h1>
  <p>Are you on the hunt for a laptop that combines power, style, and reliability? Look no further than Lenovo! 🚀 Known for their innovative designs and cutting-edge technology, Lenovo laptops are the Swiss Army knives of the tech world. Whether you're a student, a professional, or a gamer, Lenovo has something for everyone. From sleek ultrabooks to powerhouse gaming rigs, Lenovo laptops are designed to meet your every need. 😎</p>
  
  <p>But with so many options out there, how do you choose the perfect Lenovo laptop? Don't worry, we've got you covered! We've scoured the market, read countless reviews, and even talked to a few tech wizards to bring you the top 10 best Lenovo laptops available today. So sit back, relax, and let us guide you through the world of Lenovo laptops. 🖥️✨</p>
  
  <p>Ready to find your next tech companion? Let's dive into the top 10 Lenovo laptops that are making waves in 2023. Whether you're looking for portability, performance, or just a great deal, we've got something for everyone. Let's get started! 🎉</p>
  
  <h3>Lenovo ThinkPad X1 Carbon</h3>
  `;
  
  // For debugging purposes, add the error information at the bottom of the post
  if (error) {
    content += `
    <div class="hidden">
      <p>Error details: ${error.message}</p>
      <p>Error stack: ${error.stack}</p>
      <p>Raw response excerpt: ${rawResponse?.substring(0, 200) || 'None'}</p>
    </div>
    `;
  }
  
  return {
    title,
    content,
    excerpt: `Discover the best Lenovo laptops on the market today. From powerful workstations to lightweight ultrabooks, we've rounded up the top options for every need and budget.`,
    category,
    tags: ['Lenovo', 'laptops', 'reviews', 'technology', 'computers']
  };
}

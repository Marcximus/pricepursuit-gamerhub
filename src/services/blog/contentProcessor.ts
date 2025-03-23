import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { GeneratedBlogContent } from './types';
import { processTop10Content } from './top10';
import { createErrorBlogContent } from './errorHandler';

/**
 * Handles calling the edge function to generate blog content
 */
export async function callGenerateBlogEdgeFunction(
  requestPayload: any
): Promise<GeneratedBlogContent> {
  try {
    // Validate inputs - ensure we're not sending empty data
    if (!requestPayload.prompt || requestPayload.prompt.trim() === '') {
      throw new Error('Prompt cannot be empty');
    }
    
    if (!requestPayload.category || requestPayload.category.trim() === '') {
      throw new Error('Category cannot be empty');
    }
    
    // Reduce payload size for large requests
    if (requestPayload.products && Array.isArray(requestPayload.products)) {
      // Only keep essential fields and limit to 10 products max
      if (requestPayload.products.length > 10) {
        console.log(`⚠️ Limiting products to 10 maximum from ${requestPayload.products.length}`);
        requestPayload.products = requestPayload.products.slice(0, 10);
      }
      
      // Reduce product data to essential fields only
      requestPayload.products = requestPayload.products.map((product: any) => ({
        asin: product.asin,
        title: product.title?.substring(0, 100) || 'Unknown Product', 
        brand: product.brand,
        price: product.price,
        rating: product.rating,
        ratings_total: product.ratings_total,
        image_url: product.image_url || product.image
      }));
    }
    
    // Let's add detailed debugging to track the request
    const payloadJson = JSON.stringify(requestPayload);
    console.log(`📤 Request payload: ${payloadJson.substring(0, 200)}...`);
    console.log(`📦 Request payload size: ${payloadJson.length} bytes`);
    
    if (payloadJson.length === 0) {
      console.error('❌ ERROR: Request payload is empty!');
      throw new Error('Failed to create request payload');
    }
    
    // Here's the crucial part - Ensure we're explicitly setting content-type and sending JSON
    console.log('📤 Calling Supabase Edge Function with payload size:', payloadJson.length);
    
    // Call the edge function with improved options and retry logic
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // Add a delay for retries
        if (retryCount > 0) {
          console.log(`🔄 Retry attempt ${retryCount}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
        
        const response = await supabase.functions.invoke('generate-blog-post', {
          body: requestPayload,
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST'
        });
        
        console.log('📥 Edge function response received:', {
          status: response.error ? 'error' : 'success',
          dataSize: response.data ? JSON.stringify(response.data).length : 0,
          error: response.error
        });
        
        if (response.error) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`⚠️ Retrying after error: ${response.error.message}`);
            continue;
          }
          
          console.error('❌ Error generating blog post after retries:', response.error);
          return createErrorBlogContent(requestPayload.category, response.error.message || 'Unknown error');
        }
        
        // Check if response.data exists and is valid
        if (!response.data) {
          console.error('❌ Empty response data from edge function');
          return createErrorBlogContent(requestPayload.category, 'The blog generation service returned an empty response.');
        }
        
        return response.data;
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⚠️ Retrying after exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
          continue;
        }
        
        throw error; // Re-throw if we've exhausted retries
      }
    }
    
    // This should never be reached due to the while loop, but TypeScript needs a return
    return createErrorBlogContent(requestPayload.category, 'Failed to generate content after retries');
  } catch (error) {
    console.error('💥 Error in Supabase function invoke:', error);
    toast({
      title: 'Edge Function Error',
      description: 'The blog generation service is currently unavailable. Please try again later.',
      variant: 'destructive',
    });
    
    // Return a fallback response with error information
    return createErrorBlogContent(
      requestPayload.category, 
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Process the raw content data from the edge function
 */
export async function processGeneratedContent(
  responseData: any,
  category: string,
  prompt: string
): Promise<GeneratedBlogContent> {
  console.log('✅ Blog post generated successfully');
  console.log('🔄 Processing generated content...');
  console.log('📦 Response data type:', typeof responseData);
  
  let data: GeneratedBlogContent;
  
  // Handle parsing for both string and object response formats
  if (typeof responseData === 'string') {
    try {
      // Try to parse as JSON if it's a string
      console.log('🔍 Trying to parse string response as JSON');
      data = JSON.parse(responseData);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('📄 Raw response data preview:', responseData.substring(0, 200) + '...');
      
      // Create a basic structure with error information
      data = {
        title: `New ${category} Post`,
        content: `Error parsing AI content: ${parseError.message}\n\nOriginal content:\n${responseData}`,
        excerpt: "There was an error generating this post's content.",
        category: category as any,
        tags: ['error']
      };
    }
  } else {
    // If it's already an object, use it directly
    console.log('🔍 Response is already an object, using directly');
    data = responseData as GeneratedBlogContent;
  }

  // For Top 10 posts, process product data placeholders
  if (category === 'Top10' && data && data.content) {
    console.log('🔄 Processing Top10 content with product data...');
    try {
      data.content = await processTop10Content(data.content, prompt);
    } catch (processingError) {
      console.error('❌ Error processing Top10 content:', processingError);
      // Keep the content as is, just log the error
    }
  }

  return data;
}

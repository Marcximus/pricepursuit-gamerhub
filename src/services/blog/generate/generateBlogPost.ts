
/**
 * Main blog post generation function
 */
import { GeneratedBlogContent } from '../types';
import { processTop10Content } from '../top10';
import { fetchProductsForTop10 } from './productFetcher';
import { callGenerateBlogPostAPI } from './apiClient';
import { parseGenerationResponse } from './parser';
import { handleGenerationError } from './errorHandler';

/**
 * Generate a blog post based on the provided parameters
 */
export async function generateBlogPost(
  prompt: string,
  category: string,
  asin?: string,
  asin2?: string
): Promise<GeneratedBlogContent | null> {
  const startTime = Date.now();
  console.log(`🚀 [${new Date().toISOString()}] Starting blog post generation for category: ${category}`);
  console.log(`📝 User prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
  
  try {
    // For Top10 category, we need to fetch Amazon products first
    let products = [];
    if (category === 'Top10') {
      products = await fetchProductsForTop10(prompt);
      
      // Check if we have any products for Top10 posts
      console.log(`📊 Proceeding with ${products?.length || 0} products for Top10 post`);
      if (!products || products.length === 0) {
        throw new Error('Cannot generate Top10 post without product data');
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
    console.log('📤 Calling Supabase Edge Function at:', Date.now() - startTime, 'ms');
    
    // Call the API
    const response = await callGenerateBlogPostAPI(requestPayload, startTime);
    
    // Parse the response
    const data = parseGenerationResponse(response);

    // For Top 10 posts, process product data placeholders
    if (category === 'Top10' && data && data.content) {
      console.log('🔄 Processing Top10 content with product data...');
      const beforeProcessingLength = data.content.length;
      
      // Use the imported function directly instead of dynamic import
      data.content = await processTop10Content(data.content, prompt);
      
      console.log(`🔄 Content length change after processing: ${beforeProcessingLength} → ${data.content.length} characters`);
      
      if (data.content.length === 0) {
        console.error('❌ CRITICAL ERROR: Content is empty after Top10 processing!');
        throw new Error('Content processing resulted in empty content');
      }
    }

    console.log(`🎉 Blog generation completed in ${Date.now() - startTime}ms`);
    return data;
  } catch (error) {
    handleGenerationError(error, 'generateBlogPost');
    console.error('💥 Error occurred after:', Date.now() - startTime, 'ms');
    return null; // Return null to indicate failure
  }
}


/**
 * API client for blog post generation
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Call Supabase Edge Function to generate blog post content
 */
export async function callGenerateBlogPostAPI(
  requestPayload: any,
  startTime: number
): Promise<any> {
  // Add retry logic for API failures
  const maxRetries = 2;
  let response = null;
  let retryCount = 0;
  let lastError = null;
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`📤 Attempt ${retryCount + 1}/${maxRetries + 1} to call Edge Function`);
      const callStartTime = Date.now();
      
      response = await supabase.functions.invoke('generate-blog-post', {
        body: requestPayload,
      });
      
      console.log(`📥 Edge function response received in ${Date.now() - callStartTime}ms`);
      
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
  
  return response;
}

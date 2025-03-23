
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
    
    // Let's add detailed debugging to track the request
    const payloadJson = JSON.stringify(requestPayload);
    console.log(`📤 Request payload: ${payloadJson.substring(0, 200)}...`);
    console.log(`📦 Request payload size: ${payloadJson.length} bytes`);
    
    if (payloadJson.length > 5000000) { // 5MB limit for Supabase functions
      console.warn('⚠️ Request payload exceeds 5MB, may cause issues with edge function');
      toast({
        title: 'Large Request Warning',
        description: 'Your content is very large. If generation fails, try a shorter prompt.',
        variant: 'default',
      });
    }
    
    if (payloadJson.length === 0) {
      console.error('❌ ERROR: Request payload is empty!');
      throw new Error('Failed to create request payload');
    }
    
    // Here's the crucial part - Ensure we're explicitly setting content-type and sending JSON
    console.log('📤 Calling Supabase Edge Function with payload size:', payloadJson.length);
    
    // Call the edge function with improved options
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
      console.error('❌ Error generating blog post:', response.error);
      // Return a fallback response with error information for debugging
      return createErrorBlogContent(requestPayload.category, response.error.message || 'Unknown error');
    }

    // Check if response.data exists and is valid
    if (!response.data) {
      console.error('❌ Empty response data from edge function');
      // Return a fallback response with error information
      return createErrorBlogContent(requestPayload.category, 'The blog generation service returned an empty response.');
    }

    return response.data;
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
    data.content = await processTop10Content(data.content, prompt);
  }

  return data;
}

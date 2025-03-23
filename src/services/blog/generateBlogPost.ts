
import { GeneratedBlogContent } from './types';
import { handleBlogError } from './errorHandler';
import { callGenerateBlogEdgeFunction, processGeneratedContent } from './contentProcessor';
import { prepareProductDataForTop10, checkCategoryMatch } from './productDataService';

/**
 * Main function to generate blog post content
 */
export async function generateBlogPost(
  prompt: string,
  category: string,
  asin?: string,
  asin2?: string
): Promise<GeneratedBlogContent | null> {
  try {
    console.log(`🚀 Starting blog post generation for category: ${category}`);
    console.log(`📝 User prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"`);
    
    // Input validation
    if (!prompt || prompt.trim() === '') {
      throw new Error('Prompt cannot be empty');
    }
    
    if (!category || category.trim() === '') {
      throw new Error('Category cannot be empty');
    }
    
    // Check if the prompt matches the selected category
    checkCategoryMatch(prompt, category);
    
    // For Top10 category, fetch Amazon products first
    let products = [];
    if (category === 'Top10') {
      products = await prepareProductDataForTop10(prompt);
    }

    // Check if we have any products for Top10 posts
    if (category === 'Top10') {
      console.log(`📊 Proceeding with ${products?.length || 0} products for Top10 post`);
      if (!products || products.length === 0) {
        console.warn('⚠️ No products available, blog quality may be affected');
      }
    }

    // Now call the Supabase function to generate the blog post
    console.log('🧠 Calling generate-blog-post edge function...');
    
    // Create a request payload
    const requestPayload = {
      prompt,
      category,
      asin: asin || null,
      asin2: asin2 || null,
      products: category === 'Top10' ? products : []
    };
    
    // Debug log the payload
    console.log('📦 Request payload structure:', JSON.stringify({
      promptLength: prompt.length,
      category,
      asin: asin || null,
      asin2: asin2 || null,
      productsCount: category === 'Top10' ? products.length : 0
    }));
    
    // Call the edge function
    const responseData = await callGenerateBlogEdgeFunction(requestPayload);
    
    // Process the generated content
    return await processGeneratedContent(responseData, category, prompt);
    
  } catch (error) {
    handleBlogError(error, 'generateBlogPost');
    
    // Return a fallback response with error information
    return {
      title: `New ${category} Post (Error)`,
      content: `
        <h1>Error Generating Content</h1>
        <p>An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please try again in a few moments.</p>
      `,
      excerpt: "There was an error generating this content. Please try again.",
      category: category as any,
      tags: ['error']
    };
  }
}

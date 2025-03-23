
/**
 * Content generator for blog posts
 */
import { getSystemPrompt } from "../promptManager.ts";
import { parseGeneratedContent } from "../parsers/index.ts";
import { generateContentWithDeepSeek } from "../services/aiService.ts";
import { 
  enhanceReviewContent, 
  enhanceComparisonContent, 
  enhanceTop10Content 
} from "../services/enhancers/index.ts";
import { logError } from "../utils/errorHandler.ts";

/**
 * Generates and processes blog content
 */
export async function generateBlogContent(
  prompt: string, 
  category: string, 
  firstProductData: any = null, 
  secondProductData: any = null, 
  amazonProducts: any[] = null,
  apiKey: string
) {
  try {
    // Create system prompt based on category and product data if available
    console.log(`📝 Generating system prompt for ${category}...`);
    const systemPrompt = getSystemPrompt(category, firstProductData, secondProductData, amazonProducts);
    console.log(`📋 System prompt created (${systemPrompt.length} characters)`);
    
    // Generate content using DeepSeek API
    try {
      // DeepSeek no longer throws errors, it returns fallback content instead
      const generatedContent = await generateContentWithDeepSeek(systemPrompt, prompt, apiKey);
      
      // Check if we received an error message instead of content
      if (generatedContent.startsWith('# Error') || 
          generatedContent.startsWith('Error:') || 
          generatedContent.includes('Unable to generate')) {
        console.warn(`⚠️ DeepSeek returned an error message as content`);
        // Create a basic fallback response
        return {
          title: `New ${category} Post`,
          content: generatedContent || `Failed to generate content. Please try again later.`,
          excerpt: "There was a problem generating this content.",
          category,
          tags: ['error'],
          error: true
        };
      }
      
      // Parse the generated content
      console.log(`🔍 Parsing generated content...`);
      const parsedContent = parseGeneratedContent(generatedContent, category);
      console.log(`✅ Content parsed successfully`);
      console.log(`📑 Title: "${parsedContent.title}"`);
      console.log(`📌 Tags: ${parsedContent.tags?.join(', ') || 'None'}`);
      console.log(`📏 Content length: ${parsedContent.content.length} characters`);
      console.log(`📎 Excerpt length: ${parsedContent.excerpt.length} characters`);
      
      // Enhance the content with additional data based on category
      let enhancedContent = parsedContent;
      
      try {
        // If we have product data for a review, augment the parsed content
        if (firstProductData && category === 'Review') {
          enhancedContent = enhanceReviewContent(parsedContent, firstProductData, firstProductData.asin);
        }
        
        // If we have product data for a comparison, augment the parsed content
        if (firstProductData && secondProductData && category === 'Comparison') {
          enhancedContent = enhanceComparisonContent(
            parsedContent, 
            firstProductData, 
            secondProductData, 
            firstProductData.asin, 
            secondProductData.asin
          );
        }
        
        // If this is a Top10 post, ensure we have placeholders for product data
        if (category === 'Top10') {
          enhancedContent = enhanceTop10Content(parsedContent);
        }
      } catch (enhancerError) {
        // Log enhancer errors but continue with the parsed content
        logError(enhancerError, 'Error in content enhancer');
        console.warn(`⚠️ Content enhancement failed, using parsed content without enhancements`);
        enhancedContent = parsedContent;
      }
      
      console.log('🎉 Successfully generated blog content!');
      return enhancedContent;
    } catch (apiError) {
      console.error("❌ Error generating or processing content:", apiError);
      
      // Create a fallback response
      return {
        title: `New ${category} Post`,
        content: `Failed to generate content: ${apiError.message || 'Unknown error'}`,
        excerpt: "There was a problem with the content generation service.",
        category,
        tags: ['error'],
        error: true
      };
    }
  } catch (error) {
    logError(error, 'Fatal error in blog content generation');
    
    // Return a generic error response that won't break the frontend
    return {
      title: `New ${category} Post`,
      content: `An unexpected error occurred while generating content. Please try again later.`,
      excerpt: "Error in content generation.",
      category,
      tags: ['error'],
      error: true
    };
  }
}

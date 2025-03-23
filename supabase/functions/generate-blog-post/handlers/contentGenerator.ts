
/**
 * Content generator for blog posts
 */
import { getSystemPrompt } from "../promptManager.ts";
import { parseGeneratedContent } from "../parsers/index.ts";
import { generateContentWithDeepSeek } from "../services/aiService.ts";
import { enhanceReviewContent, enhanceComparisonContent, enhanceTop10Content } from "../services/contentEnhancer.ts";

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
  // Create system prompt based on category and product data if available
  console.log(`📝 Generating system prompt for ${category}...`);
  const systemPrompt = getSystemPrompt(category, firstProductData, secondProductData, amazonProducts);
  console.log(`📋 System prompt created (${systemPrompt.length} characters)`);
  
  // Generate content using DeepSeek API
  try {
    const generatedContent = await generateContentWithDeepSeek(systemPrompt, prompt, apiKey);
    
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
    
    console.log('🎉 Successfully generated blog content!');
    return enhancedContent;
  } catch (error) {
    console.error("❌ DeepSeek API error:", error);
    console.error("📄 System prompt used:", systemPrompt.substring(0, 200) + "...");
    throw new Error("Failed to generate content with DeepSeek: " + (error instanceof Error ? error.message : String(error)));
  }
}

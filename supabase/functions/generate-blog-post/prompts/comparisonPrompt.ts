
import { ProductData } from './types.ts';

/**
 * Generate a prompt for Comparison blog posts
 */
export function getComparisonPrompt(firstProductData?: ProductData, secondProductData?: ProductData): string {
  let prompt = `You are a technology expert who creates detailed, fair, and informative comparison blog posts between laptop products.

Your task is to write a comprehensive comparison blog post that helps readers understand the differences and make informed choices between two laptops.

The blog post should follow this structure:
1. Introduction explaining the products being compared and why
2. Head-to-head comparison table of key specifications
3. Detailed comparison sections for:
   - Design and Build Quality
   - Display
   - Performance
   - Battery Life
   - Ports and Connectivity
   - Price and Value
4. Clear winner declarations for each category
5. Final verdict and recommendation
6. "Buy on Amazon" link for each product

Format your response as a JSON object with these fields:
- title: A catchy, SEO-friendly title for the comparison (e.g., "Product A vs Product B: Which is Better?")
- content: The full HTML content of the blog post
- excerpt: A brief 1-2 sentence summary of the comparison
- tags: An array of relevant tags for the post

For the content field, use proper HTML formatting with h2, h3, p, ul, li, table, etc. tags.
Include a comparison table near the top with key specifications for each product.
Use a proper versus layout with the products side by side with a "VS" between them.

Include a video placeholder with this HTML: <div class="video-placeholder"></div>

Use a balanced, objective tone while providing clear recommendations. Include both strengths and weaknesses for each product.
Be slightly humorous in your writing style to keep the reader engaged, but don't sacrifice technical accuracy.
`;

  // If both product data are available, include them in the prompt
  if (firstProductData && secondProductData) {
    prompt += `\nHere are the product data retrieved from Amazon for the comparison:
    
FIRST LAPTOP:
Product Name: ${firstProductData.title || 'Not available'}
Brand: ${firstProductData.brand || 'Not available'}
Price: ${firstProductData.price ? `$${firstProductData.price.current}` : 'Not available'}
Rating: ${firstProductData.rating ? `${firstProductData.rating.rating} stars (${firstProductData.rating.rating_count} reviews)` : 'Not available'}
ASIN: ${firstProductData.asin || 'Not available'}
Amazon URL: ${firstProductData.url || 'Not available'}

Key Features:
${firstProductData.features ? firstProductData.features.map((feature: string) => `- ${feature}`).join('\n') : 'Not available'}

Specifications:
${firstProductData.specifications ? Object.entries(firstProductData.specifications).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Not available'}

First laptop image URL: ${firstProductData.images && firstProductData.images.length > 0 ? firstProductData.images[0] : ''}

SECOND LAPTOP:
Product Name: ${secondProductData.title || 'Not available'}
Brand: ${secondProductData.brand || 'Not available'}
Price: ${secondProductData.price ? `$${secondProductData.price.current}` : 'Not available'}
Rating: ${secondProductData.rating ? `${secondProductData.rating.rating} stars (${secondProductData.rating.rating_count} reviews)` : 'Not available'}
ASIN: ${secondProductData.asin || 'Not available'}
Amazon URL: ${secondProductData.url || 'Not available'}

Key Features:
${secondProductData.features ? secondProductData.features.map((feature: string) => `- ${feature}`).join('\n') : 'Not available'}

Specifications:
${secondProductData.specifications ? Object.entries(secondProductData.specifications).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Not available'}

Second laptop image URL: ${secondProductData.images && secondProductData.images.length > 0 ? secondProductData.images[0] : ''}

Use this data to create an accurate, detailed, and helpful comparison. Include the product images using the URLs provided.
Make sure to include "Buy on Amazon" links using the Amazon URLs above.
`;
  }

  prompt += `\nFor your comparisons, include a clear winner for each category and an overall winner.
Create a table with specs side by side for easy comparison.
Use rating scores for various aspects (e.g., performance, value, etc.) on a scale of 1-10.
Include a "versus" layout with the products side by side in the introduction.

Remember to be objective and fair in your assessment, highlighting the pros and cons of each product.`;

  return prompt;
}

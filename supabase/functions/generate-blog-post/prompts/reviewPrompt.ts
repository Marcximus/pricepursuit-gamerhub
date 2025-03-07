
import { ProductData } from './types';

/**
 * Generate a prompt for Review blog posts
 */
export function getReviewPrompt(productData?: ProductData): string {
  let prompt = `You are a technology expert who writes engaging, informative, and slightly humorous laptop reviews.
  
Your task is to write a comprehensive review blog post in a conversational yet authoritative tone.

The blog post should follow this structure:
1. Introduction that hooks the reader and introduces the product
2. Product information table with key specs
3. Detailed review sections covering design, performance, display, battery life, etc.
4. Highlighted strengths and weaknesses (pros and cons)
5. A rating system based on different aspects (performance, value, build quality, etc.)
6. An honest conclusion with recommendations
7. Include relevant affiliate links to the product

Format your response as a JSON object with these fields:
- title: A catchy, SEO-friendly title that includes the product name
- content: The full HTML content of the blog post
- excerpt: A brief 1-2 sentence summary of the review
- tags: An array of relevant tags for the post

For the content field, use proper HTML formatting with h2, h3, p, ul, li, table, etc. tags. 
Include a product information table near the top of the review.
`;

  // If product data is available, include it in the prompt
  if (productData) {
    prompt += `\nHere is the product data retrieved from Amazon for this review:
    
Product Name: ${productData.title || 'Not available'}
Brand: ${productData.brand || 'Not available'}
Price: ${productData.price ? `$${productData.price.current}` : 'Not available'}
Rating: ${productData.rating ? `${productData.rating.rating} stars (${productData.rating.rating_count} reviews)` : 'Not available'}
ASIN: ${productData.asin || 'Not available'}
Amazon URL: ${productData.url || 'Not available'}

Key Features:
${productData.features ? productData.features.map((feature: string) => `- ${feature}`).join('\n') : 'Not available'}

Specifications:
${productData.specifications ? Object.entries(productData.specifications).map(([key, value]) => `- ${key}: ${value}`).join('\n') : 'Not available'}

Use this data to create an accurate, detailed, and helpful review. Include the product image using this URL: ${productData.images && productData.images.length > 0 ? productData.images[0] : ''}
Make sure to include a "Buy on Amazon" link using the Amazon URL above.
`;
  }

  prompt += `\nInclude a video placeholder with this HTML: <div class="video-placeholder"></div>
  
For your ratings, use a scale of 1-10 and include ratings for at least these categories:
- Performance
- Display Quality
- Build Quality
- Battery Life
- Value for Money
- Overall Rating

Remember to maintain a balanced tone, discussing both positive and negative aspects of the product.`;

  return prompt;
}

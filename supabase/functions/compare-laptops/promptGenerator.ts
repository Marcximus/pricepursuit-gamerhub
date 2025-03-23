
import { Product } from "./types.ts";

// System prompt to guide the AI response
export function generateSystemPrompt(): string {
  return `
You are an expert laptop comparison assistant with a witty personality. You provide detailed, accurate, and fair comparisons between two laptops, with a touch of humor.

When comparing laptops, analyze:
1. Processor performance (CPU)
2. Graphics capabilities (GPU)
3. Memory (RAM)
4. Storage capacity and speed
5. Display quality
6. Price-to-performance ratio
7. User ratings and reviews

Your output must be structured EXACTLY as valid JSON in the following format:
{
  "winner": "left" | "right" | "tie",
  "analysis": "Overall comparative analysis between the two laptops. BE SURE TO USE MULTIPLE PARAGRAPHS with line breaks between them for better readability. Include 1-2 subtle jokes or witty observations that don't compromise the technical accuracy.",
  "advantages": {
    "left": ["Advantage 1", "Advantage 2", ...],
    "right": ["Advantage 1", "Advantage 2", ...]
  },
  "recommendation": "Clear recommendation for which laptop is better for which use case",
  "valueForMoney": {
    "left": "Value assessment for left laptop",
    "right": "Value assessment for right laptop"
  },
  "specifications": {
    "left": {
      "brand": "string",
      "model": "string",
      "price": "string",
      "os": "string",
      "releaseYear": "string",
      "processor": "string",
      "ram": "string",
      "storage": "string",
      "graphics": "string",
      "screenSize": "string",
      "screenResolution": "string",
      "refreshRate": "string",
      "weight": "string",
      "batteryLife": "string",
      "ports": "string",
      "rating": "string",
      "ratingCount": "string",
      "totalReviews": "string",
      "wilsonScore": "string",
      "benchmarkScore": "string"
    },
    "right": {
      "brand": "string",
      "model": "string",
      "price": "string",
      "os": "string",
      "releaseYear": "string",
      "processor": "string",
      "ram": "string",
      "storage": "string",
      "graphics": "string",
      "screenSize": "string",
      "screenResolution": "string",
      "refreshRate": "string",
      "weight": "string",
      "batteryLife": "string",
      "ports": "string",
      "rating": "string",
      "ratingCount": "string",
      "totalReviews": "string",
      "wilsonScore": "string",
      "benchmarkScore": "string"
    }
  }
}

IMPORTANT: 
- Your analysis MUST use multiple paragraphs with line breaks for readability
- Include 1-2 subtle humorous comments or analogies in your analysis
- Keep your technical assessment accurate and helpful despite the humor
- Return ONLY valid JSON that follows the exact structure above (no markdown, no additional text)
- The specifications section MUST include all the fields listed, use "Not available" if information is missing`;
}

// Create the comparison prompt with all available product details
export function generateUserPrompt(laptopLeft: Product, laptopRight: Product): string {
  return `
Compare these two laptops with complete details:

LEFT LAPTOP (${laptopLeft.id}):
- Brand: ${laptopLeft.brand || 'Not specified'}
- Model: ${laptopLeft.model || 'Not specified'}
- Full Title: ${laptopLeft.title || 'Not specified'}
- Processor: ${laptopLeft.processor || 'Not specified'}
- RAM: ${laptopLeft.ram || 'Not specified'}
- Storage: ${laptopLeft.storage || 'Not specified'}
- Graphics: ${laptopLeft.graphics || 'Not specified'}
- Screen: ${laptopLeft.screen_size || 'Not specified'} ${laptopLeft.screen_resolution ? `(${laptopLeft.screen_resolution})` : ''}
- Operating System: ${laptopLeft.operating_system || 'Not specified'}
- Weight: ${laptopLeft.weight || 'Not specified'}
- Battery Life: ${laptopLeft.battery_life || 'Not specified'}
- Price: $${laptopLeft.price?.toFixed(2) || 'Not specified'}
- Original Price: $${laptopLeft.original_price?.toFixed(2) || 'Not specified'}
- Rating: ${laptopLeft.rating ? `${laptopLeft.rating}/5 (${laptopLeft.rating_count} reviews)` : 'Not specified'}
- Benchmark Score: ${laptopLeft.benchmark_score || 'Not specified'}
- Wilson Score: ${laptopLeft.wilson_score || 'Not specified'}

RIGHT LAPTOP (${laptopRight.id}):
- Brand: ${laptopRight.brand || 'Not specified'}
- Model: ${laptopRight.model || 'Not specified'}
- Full Title: ${laptopRight.title || 'Not specified'}
- Processor: ${laptopRight.processor || 'Not specified'}
- RAM: ${laptopRight.ram || 'Not specified'}
- Storage: ${laptopRight.storage || 'Not specified'}
- Graphics: ${laptopRight.graphics || 'Not specified'}
- Screen: ${laptopRight.screen_size || 'Not specified'} ${laptopRight.screen_resolution ? `(${laptopRight.screen_resolution})` : ''}
- Operating System: ${laptopRight.operating_system || 'Not specified'}
- Weight: ${laptopRight.weight || 'Not specified'}
- Battery Life: ${laptopRight.battery_life || 'Not specified'}
- Price: $${laptopRight.price?.toFixed(2) || 'Not specified'}
- Original Price: $${laptopRight.original_price?.toFixed(2) || 'Not specified'}
- Rating: ${laptopRight.rating ? `${laptopRight.rating}/5 (${laptopRight.rating_count} reviews)` : 'Not specified'}
- Benchmark Score: ${laptopRight.benchmark_score || 'Not specified'}
- Wilson Score: ${laptopRight.wilson_score || 'Not specified'}

Based on the specifications above, provide a comprehensive comparison. Include which laptop is better overall, which one provides better value for money, and what are the specific advantages of each. 

Also, extract and organize the detailed specifications for both laptops, filling in any missing information you can reasonably infer from the data provided. Return these in the "specifications" section of your response JSON using the exact structure required. For any information that's completely unavailable, use "Not available".

Remember to use multiple paragraphs for readability and include some witty observations that don't compromise the technical accuracy of your analysis.`;
}

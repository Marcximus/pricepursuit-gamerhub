
import { OpenAI } from "https://esm.sh/openai@4.24.1";

export function createDeepSeekClient(apiKey: string) {
  return new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: apiKey,
  });
}

export async function processTitleWithAI(title: string, description: string | null, deepseekApiKey: string) {
  try {
    const openai = createDeepSeekClient(deepseekApiKey);
    
    // Enhanced prompt with more explicit instructions
    const prompt = `Extract laptop specifications from this product information. If a value is not clearly stated, make an educated guess based on context or leave as null only if completely uncertain.

Title: ${title}
Description: ${description || 'Not available'}

Required fields (DO NOT return null for these):
- brand: Extract from title or description. This is the manufacturer name (e.g., Lenovo, HP, Dell).
- model: Extract model name/number from title. If not explicit, use identifying series/product line.
- processor: CPU model in standardized format
- ram: Memory amount in GB (convert if in other units)
- storage: Storage capacity and type

Optional fields (can be null if uncertain):
- screen_size: Screen size in inches
- graphics: GPU model in standardized format
- current_price: Current price as numeric value only
- original_price: Original price as numeric value only

Return a JSON object with these fields. Example:
{
  "brand": "Lenovo",
  "model": "IdeaPad 3",
  "screen_size": "15.6",
  "processor": "Intel Core i5-1235U",
  "graphics": "Intel Iris Xe",
  "ram": "8",
  "storage": "512GB SSD",
  "current_price": 699.99,
  "original_price": 899.99
}`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a specialized AI trained to extract laptop specifications with high accuracy. Always provide values for required fields, make educated guesses if needed."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3 // Lower temperature for more consistent outputs
    });

    try {
      const extractedData = JSON.parse(completion.choices[0].message.content);
      
      // Validate required fields
      const requiredFields = ['brand', 'model', 'processor', 'ram', 'storage'];
      const missingFields = requiredFields.filter(field => !extractedData[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure numeric fields are properly formatted
      if (extractedData.current_price) {
        extractedData.current_price = parseFloat(extractedData.current_price);
      }
      if (extractedData.original_price) {
        extractedData.original_price = parseFloat(extractedData.original_price);
      }

      // Normalize RAM value to always be a number
      extractedData.ram = extractedData.ram.toString().replace(/GB|gb|gigabytes?/i, '').trim();

      console.log('Successfully extracted data:', extractedData);
      return extractedData;
    } catch (parseError) {
      console.error('AI Response:', completion.choices[0].message.content);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error processing with DeepSeek AI:', error);
    throw error;
  }
}

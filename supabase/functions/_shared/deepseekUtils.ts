import { OpenAI } from "https://esm.sh/openai@4.24.1";

export function createDeepSeekClient(apiKey: string) {
  return new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: apiKey,
  });
}

export async function processTitleWithAI(productData: any, deepseekApiKey: string) {
  try {
    const openai = createDeepSeekClient(deepseekApiKey);
    
    const prompt = `You MUST respond with ONLY a JSON object and NO additional text or explanation.

Given this product information:
Title: ${productData.title || 'Not available'}
Description: ${productData.description || 'Not available'}
Features: ${JSON.stringify(productData.feature_bullets || [])}
Specifications: ${JSON.stringify(productData.specifications || {})}
Current Price: ${productData.price?.current_price || 'Not available'}
Original Price: ${productData.price?.original_price || 'Not available'}

Return a valid JSON object with these exact fields in this format:
{
  "brand": string,       // Company name (e.g., "Lenovo", "HP", "Dell")
  "model": string,       // Model identifier (e.g., "IdeaPad 3", "Pavilion 15")
  "processor": string,   // CPU model (e.g., "Intel Core i5-1235U")
  "ram": string,        // Memory in GB, numbers only (e.g., "8", "16")
  "storage": string,    // Storage spec (e.g., "512GB SSD", "1TB HDD")
  "screen_size": string | null,    // Display size in inches (e.g., "15.6")
  "graphics": string | null,       // GPU model (e.g., "Intel Iris Xe", "NVIDIA RTX 3060")
  "current_price": number | null,  // Current price as number (e.g., 699.99)
  "original_price": number | null  // Original price as number (e.g., 899.99)
}

CRITICAL REQUIREMENTS:
1. Response MUST be a valid JSON object
2. NO explanatory text before or after the JSON
3. brand, model, processor, ram, and storage are REQUIRED - make educated guesses if needed
4. Use null for missing optional fields
5. Format must match the example EXACTLY`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-r1-text",
      messages: [
        {
          role: "system",
          content: "You are a JSON formatting machine. You ONLY output valid JSON objects, nothing else. No explanations, no text, just JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1 // Very low temperature for more consistent outputs
    });

    try {
      // Log the raw response for debugging
      console.log('Raw AI response:', completion.choices[0].message.content);
      
      // Try to clean the response in case there's any extra text
      let jsonString = completion.choices[0].message.content.trim();
      if (jsonString.includes('{')) {
        jsonString = jsonString.substring(jsonString.indexOf('{'));
        if (jsonString.includes('}')) {
          jsonString = jsonString.substring(0, jsonString.lastIndexOf('}') + 1);
        }
      }
      
      const extractedData = JSON.parse(jsonString);
      
      // Validate required fields
      const requiredFields = ['brand', 'model', 'processor', 'ram', 'storage'];
      const missingFields = requiredFields.filter(field => !extractedData[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Normalize numeric fields
      if (extractedData.current_price) {
        extractedData.current_price = parseFloat(extractedData.current_price);
      }
      if (extractedData.original_price) {
        extractedData.original_price = parseFloat(extractedData.original_price);
      }

      // Normalize RAM value to always be a number string without units
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


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
    const prompt = `Extract and standardize laptop specifications from this title and description:
Title: ${title}
Description: ${description || 'Not available'}

Return ONLY a JSON object with these fields:
{
  "brand": "Manufacturer name (e.g., Lenovo, HP, Dell)",
  "model": "Model name/number",
  "screen_size": "Screen size in inches",
  "processor": "CPU model (standardized format)",
  "graphics": "GPU model (standardized format)",
  "ram": "Memory amount in GB",
  "storage": "Storage capacity and type",
  "current_price": "Current price in numeric format (e.g., 999.99)",
  "original_price": "Original/previous price in numeric format (e.g., 1299.99)"
}

Notes:
- Extract only factual information present in the text
- Use consistent formatting for all values
- Standardize names (e.g., "Intel Core i7-1165G7" instead of "i7 1165G7")
- Remove marketing terms and stick to technical specifications
- Ensure RAM is in GB (convert if in another unit)
- For storage, combine type and capacity (e.g., "512GB SSD")
- For prices, only extract numeric values (e.g., 999.99 instead of "$999.99")
- Original price should be higher than current price if both are present`;

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are a specialized AI trained to extract and standardize laptop specifications."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    try {
      const extractedData = JSON.parse(completion.choices[0].message.content);
      return extractedData;
    } catch (parseError) {
      console.error('Failed to parse AI response:', completion.choices[0].message.content);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error processing with DeepSeek AI:', error);
    throw error;
  }
}

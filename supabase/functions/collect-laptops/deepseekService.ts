
import { OxylabsResult, ProcessedLaptopData } from './types.ts';

export async function processWithDeepseek(laptopData: OxylabsResult): Promise<ProcessedLaptopData> {
  console.log('[DeepSeek] Processing laptop:', {
    title: laptopData.title,
    asin: laptopData.asin,
    price: laptopData.price,
    rating: laptopData.rating,
    reviews_count: laptopData.reviews_count,
    manufacturer: laptopData.manufacturer
  });

  const systemPrompt = `You are a laptop data processor. Extract and standardize laptop specifications based on the provided data and your knowledge.

Return ONLY valid JSON with the following structure:
{
  "asin": "string",
  "processor": "string",
  "ram": "string",
  "storage": "string",
  "screen_size": "string",
  "screen_resolution": "string",
  "graphics": "string",
  "weight": "string",
  "battery_life": "string",
  "brand": "string",
  "model": "string"
}

Use these rules when extracting data:
1. ASIN: Use the exact provided ASIN
2. Processor: Use official names (e.g., "Intel Core i7-12700H", "AMD Ryzen 7 7735U", "Apple M2 Pro")
3. RAM: Include size and type if available (e.g., "16GB DDR4", "32GB DDR5")
4. Storage: Include size and type (e.g., "512GB SSD", "1TB NVMe SSD")
5. Screen Size: Use inches (e.g., "15.6 inches", "14 inches")
6. Screen Resolution: Use standard formats (e.g., "1920x1080", "2560x1440", "3840x2160")
7. Graphics: Use official names (e.g., "NVIDIA GeForce RTX 4060", "Intel Iris Xe Graphics")
8. Weight: Use kg with one decimal (e.g., "1.8 kg", "2.3 kg")
9. Battery Life: Use hours (e.g., "10 hours", "6 hours")
10. Brand: Use official names (e.g., "Lenovo", "HP", "Dell", "ASUS")
11. Model: Extract specific model name/number (e.g., "ThinkPad X1 Carbon", "Pavilion 15")

If you cannot determine a value with high confidence, use null. Always format consistently.`;

  const userPrompt = `Process this laptop data and return standardized specifications:

ASIN: ${laptopData.asin}
Title: ${laptopData.title}
Description: ${laptopData.description || 'No description available'}
Manufacturer: ${laptopData.manufacturer || 'Unknown'}
Price: ${laptopData.price || 'Not available'}
Rating: ${laptopData.rating || 'Not available'}
Reviews Count: ${laptopData.reviews_count || 'Not available'}

Raw Product Data:
${JSON.stringify(laptopData, null, 2)}`;

  try {
    console.log('[DeepSeek] Sending request with prompts:', {
      systemPrompt,
      userPrompt,
      model: 'deepseek-chat'
    });

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DeepSeek] API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[DeepSeek] Raw API response:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('[DeepSeek] Unexpected API response structure:', data);
      throw new Error('Invalid API response structure from DeepSeek');
    }

    // Clean up the content by removing markdown code block syntax and any potential whitespace
    let content = data.choices[0].message.content.trim();
    content = content.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    
    // Log the cleaned content for debugging
    console.log('[DeepSeek] Cleaned content:', content);

    try {
      const processedData = JSON.parse(content);
      
      // Validate required fields and data structure
      const requiredFields = ['asin', 'processor', 'ram', 'storage', 'screen_size', 'brand', 'model'];
      for (const field of requiredFields) {
        if (!processedData.hasOwnProperty(field)) {
          console.error(`[DeepSeek] Missing required field: ${field}`);
          throw new Error(`Invalid JSON structure: missing ${field}`);
        }
      }

      // Validate ASIN matches
      if (processedData.asin !== laptopData.asin) {
        console.error('[DeepSeek] ASIN mismatch:', {
          original: laptopData.asin,
          processed: processedData.asin
        });
        processedData.asin = laptopData.asin;
      }

      console.log('[DeepSeek] Successfully processed data:', processedData);
      return processedData;

    } catch (parseError) {
      console.error('[DeepSeek] Error parsing cleaned content:', {
        error: parseError,
        content: content
      });
      throw new Error('Invalid JSON response from DeepSeek');
    }
  } catch (error) {
    console.error('[DeepSeek] Processing error:', error);
    throw error;
  }
}

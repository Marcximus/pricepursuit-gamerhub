
import { OxylabsResult, ProcessedLaptopData } from './types.ts';

export async function processWithDeepseek(laptopData: OxylabsResult): Promise<ProcessedLaptopData> {
  console.log('[DeepSeek] Processing laptop:', {
    title: laptopData.title,
    asin: laptopData.asin
  });

  const systemPrompt = `You are a laptop data processor. Extract and standardize laptop specifications from the provided data. 
Return ONLY valid JSON with the following structure, ensuring all values are properly formatted strings or numbers:

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

Requirements:
- ASIN must match the input data exactly
- Extract specific numeric values where possible (e.g., "16GB" for RAM, "512GB" for storage)
- Standardize formats (e.g., "15.6 inches" for screen size)
- If a value cannot be determined, use null
- Ensure consistent formatting for each field
- The output MUST be valid JSON without any additional text or explanation`;

  const userPrompt = `Process this laptop data and return standardized specifications:
Title: ${laptopData.title}
ASIN: ${laptopData.asin}
Description: ${laptopData.description || 'No description available'}`;

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

    const content = data.choices[0].message.content.trim();
    console.log('[DeepSeek] Processing content:', content);

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
      console.error('[DeepSeek] Error parsing response:', {
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

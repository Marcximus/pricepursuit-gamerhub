
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
- The output MUST be valid JSON`;

  const userPrompt = `Process this laptop data and return standardized specifications:
Title: ${laptopData.title}
ASIN: ${laptopData.asin}
Description: ${laptopData.description || 'No description available'}`;

  try {
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
      throw new Error(`[DeepSeek] API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const processedData = JSON.parse(content);
      
      // Validate ASIN matches
      if (processedData.asin !== laptopData.asin) {
        console.error('[DeepSeek] ASIN mismatch:', {
          original: laptopData.asin,
          processed: processedData.asin
        });
        processedData.asin = laptopData.asin;
      }

      return processedData;
    } catch (parseError) {
      console.error('[DeepSeek] Error parsing response:', parseError);
      throw new Error('Invalid JSON response from DeepSeek');
    }
  } catch (error) {
    console.error('[DeepSeek] Processing error:', error);
    throw error;
  }
}

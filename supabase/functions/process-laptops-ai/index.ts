import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')!;
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')!;
const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are a laptop data processor. Extract and standardize laptop specifications based on the provided data and your knowledge.

Return ONLY valid JSON with the following structure, ensuring all numbers are properly formatted as numbers not strings:
{
  "processor": "string",
  "ram": "string",
  "storage": "string",
  "screen_size": "string",
  "screen_resolution": "string",
  "graphics": "string",
  "weight": "string",
  "battery_life": "string",
  "brand": "string",
  "model": "string",
  "current_price": number,
  "original_price": number,
  "rating": number,
  "rating_count": number
}

Use these rules when extracting data:
1. Processor: Use official names (e.g., "Intel Core i7-12700H", "AMD Ryzen 7 7735U", "Apple M2 Pro")
2. RAM: Include size and type if available (e.g., "16GB DDR4", "32GB DDR5")
3. Storage: Include size and type (e.g., "512GB SSD", "1TB NVMe SSD")
4. Screen Size: Use inches (e.g., "15.6 inches", "14 inches")
5. Screen Resolution: Use standard formats (e.g., "1920x1080", "2560x1440", "3840x2160")
6. Graphics: Use official names (e.g., "NVIDIA GeForce RTX 4060", "Intel Iris Xe Graphics")
7. Weight: Use kg with one decimal (e.g., "1.8 kg", "2.3 kg")
8. Battery Life: Use hours (e.g., "10 hours", "6 hours")
9. Brand: Use official names (e.g., "Lenovo", "HP", "Dell", "ASUS")
10. Model: Extract specific model name/number (e.g., "ThinkPad X1 Carbon", "Pavilion 15")
11. Current Price: Use numeric value without currency symbol (e.g., 999.99)
12. Original Price: Use numeric value without currency symbol (e.g., 1299.99)
13. Rating: Use numeric value between 0-5 with one decimal (e.g., 4.5)
14. Rating Count: Use integer value (e.g., 1234)

If you cannot determine a value with high confidence, use null.
VERY IMPORTANT: Make sure ALL numeric values are proper numbers, not strings. For example: current_price should be 999.99, not "999.99"`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asin } = await req.json();
    
    if (!asin) {
      throw new Error('No ASIN provided');
    }

    console.log(`Processing ASIN: ${asin}`);

    // Call Oxylabs realtime API
    const oxyLabsResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
      },
      body: JSON.stringify({
        source: 'amazon_product',
        query: asin,
        domain: 'com',
        geo_location: '90210',
        parse: true
      })
    });

    if (!oxyLabsResponse.ok) {
      throw new Error(`Oxylabs API error: ${oxyLabsResponse.status}`);
    }

    const rawData = await oxyLabsResponse.json();
    console.log('Raw Oxylabs data:', JSON.stringify(rawData, null, 2));

    // Send raw data to DeepSeek
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Process this raw laptop data and return standardized specifications:\n\n${JSON.stringify(rawData, null, 2)}`
          }
        ],
        temperature: 1.0
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    console.log('DeepSeek response:', JSON.stringify(deepseekData, null, 2));

    // Extract the content from the DeepSeek response
    const aiContent = deepseekData.choices[0]?.message?.content;
    if (!aiContent) {
      throw new Error('No content in DeepSeek response');
    }

    // Clean up the content by removing markdown code block syntax
    let cleanContent = aiContent.trim()
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '');

    console.log('Cleaned AI response:', cleanContent);

    try {
      const specs = JSON.parse(cleanContent);

      // Type validation for numeric fields
      const numericFields = ['current_price', 'original_price', 'rating', 'rating_count'];
      for (const field of numericFields) {
        if (specs[field] && typeof specs[field] === 'string') {
          specs[field] = parseFloat(specs[field]);
        }
      }

      // Update product with processed specifications
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...specs,
          ai_processing_status: 'completed',
          ai_processed_at: new Date().toISOString()
        })
        .eq('asin', asin);

      if (updateError) {
        throw updateError;
      }

      return new Response(
        JSON.stringify({ success: true, asin }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (parseError) {
      console.error('Error parsing DeepSeek response:', parseError);
      throw new Error(`Invalid JSON response from DeepSeek: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Error in process-laptops-ai function:', error);
    
    // Update product status to error if we have an ASIN
    if (error.asin) {
      try {
        await supabase
          .from('products')
          .update({
            ai_processing_status: 'error',
            ai_processed_at: new Date().toISOString()
          })
          .eq('asin', error.asin);
      } catch (updateError) {
        console.error('Error updating product status:', updateError);
      }
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

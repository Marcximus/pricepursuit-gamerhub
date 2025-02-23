
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
12. Reviews & Ratings

If you cannot determine a value with high confidence, use null. Always format consistently.`;

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
        temperature: 0.1
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    console.log('DeepSeek response:', JSON.stringify(deepseekData, null, 2));

    // Clean up the content by removing markdown code block syntax
    let processedData = deepseekData.choices[0].message.content.trim()
      .replace(/^```json\s*/, '')
      .replace(/```\s*$/, '');

    try {
      const specs = JSON.parse(processedData);

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
      throw new Error('Invalid JSON response from DeepSeek');
    }

  } catch (error) {
    console.error('Error in process-laptops-ai function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

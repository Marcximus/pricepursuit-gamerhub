
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const oxyLabsUsername = Deno.env.get('OXYLABS_USERNAME')!;
const oxyLabsPassword = Deno.env.get('OXYLABS_PASSWORD')!;
const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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
  "model": "string",
  "current_price": number,
  "original_price": number,
  "average_rating": number,
  "total_reviews": number,
  "review_data": {
    "rating_breakdown": {
      "1": number,
      "2": number,
      "3": number,
      "4": number,
      "5": number
    },
    "recent_reviews": [
      {
        "rating": number,
        "title": "string",
        "content": "string",
        "reviewer_name": "string",
        "review_date": "string",
        "verified_purchase": boolean,
        "helpful_votes": number
      }
    ]
  }
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
12. Price: Extract current price and original/list price if available
13. Ratings: Include average rating (out of 5) and total number of reviews
14. Review Data: Include rating breakdown by star rating and up to 5 most recent reviews with all available details

If you cannot determine a value with high confidence, use null. Always format consistently.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asin } = await req.json();
    console.log('Processing ASIN:', asin);

    // Fetch product data from Oxylabs
    const oxyLabsResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${oxyLabsUsername}:${oxyLabsPassword}`)
      },
      body: JSON.stringify({
        source: 'amazon',
        url: `https://www.amazon.com/dp/${asin}`,
        parse: true
      })
    });

    const oxyLabsData = await oxyLabsResponse.json();
    console.log('Oxylabs data received');

    // Process with Deepseek
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
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
            content: JSON.stringify(oxyLabsData)
          }
        ]
      })
    });

    const deepseekData = await deepseekResponse.json();
    console.log('Deepseek response received');

    let processedData;
    try {
      const content = deepseekData.choices[0].message.content;
      // Remove any markdown code block syntax if present
      const jsonString = content.replace(/```json\n?|\n?```/g, '').trim();
      processedData = JSON.parse(jsonString);
      console.log('Successfully parsed AI response');
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to parse AI response');
    }

    // Update the product in the database
    const { error: updateError } = await supabase
      .from('products')
      .update({
        processor: processedData.processor,
        ram: processedData.ram,
        storage: processedData.storage,
        screen_size: processedData.screen_size,
        screen_resolution: processedData.screen_resolution,
        graphics: processedData.graphics,
        weight: processedData.weight,
        battery_life: processedData.battery_life,
        brand: processedData.brand,
        model: processedData.model,
        current_price: processedData.current_price,
        original_price: processedData.original_price,
        average_rating: processedData.average_rating,
        total_reviews: processedData.total_reviews,
        review_data: processedData.review_data,
        ai_processing_status: 'completed',
        ai_processed_at: new Date().toISOString()
      })
      .eq('asin', asin);

    if (updateError) {
      console.error('Error updating product:', updateError);
      throw updateError;
    }

    console.log('Product updated successfully');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-laptops-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

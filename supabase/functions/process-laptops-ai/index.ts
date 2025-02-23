
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { OpenAI } from "https://esm.sh/openai@4.24.1";

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: DEEPSEEK_API_KEY,
});

const BATCH_SIZE = 10;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function processTitleWithAI(title: string, description: string | null) {
  try {
    const prompt = `Extract the following features from this laptop product:
Title: "${title}"
${description ? `Description: "${description}"` : ''}

Please extract and standardize these key features in the following format:
{
  "brand": "Name of the manufacturer (e.g., Dell, HP, Lenovo)",
  "model": "Model line/series name",
  "screen_size": "Display size in inches",
  "processor": "CPU model (standardized format)",
  "graphics": "GPU model (standardized format)",
  "ram": "Memory amount in GB",
  "storage": "Storage capacity and type",
  "current_price": "Current price in numeric format (e.g., 999.99)",
  "original_price": "Original/previous price in numeric format (e.g., 1299.99)"
}

Notes:
- Only extract information that is clearly stated
- Use null for any features that cannot be confidently determined
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
    console.error('Error in AI processing:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get unprocessed laptops
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, title, description')
      .eq('is_laptop', true)
      .eq('ai_processing_status', 'pending')
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Processing batch of ${laptops.length} laptops`);

    // Process each laptop in the batch
    for (const laptop of laptops) {
      try {
        // Mark as in progress
        await supabase
          .from('products')
          .update({ ai_processing_status: 'processing' })
          .eq('id', laptop.id);

        // Process with AI
        const aiResult = await processTitleWithAI(laptop.title, laptop.description);

        // Update laptop with AI results
        const { error: updateError } = await supabase
          .from('products')
          .update({
            brand: aiResult.brand,
            model: aiResult.model,
            screen_size: aiResult.screen_size,
            processor: aiResult.processor,
            graphics: aiResult.graphics,
            ram: aiResult.ram,
            storage: aiResult.storage,
            current_price: aiResult.current_price,
            original_price: aiResult.original_price,
            ai_processing_status: 'completed',
            ai_processed_at: new Date().toISOString()
          })
          .eq('id', laptop.id);

        if (updateError) {
          console.error(`Error updating laptop ${laptop.id}:`, updateError);
          throw updateError;
        }

        console.log(`Successfully processed laptop ${laptop.id}`);
      } catch (error) {
        console.error(`Error processing laptop ${laptop.id}:`, error);
        
        // Mark as failed
        await supabase
          .from('products')
          .update({
            ai_processing_status: 'error',
            ai_processed_at: new Date().toISOString()
          })
          .eq('id', laptop.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: laptops.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in process-laptops-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


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
            content: `You are a laptop data processor. Extract and standardize laptop specifications from raw product data. Return valid JSON only.`
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

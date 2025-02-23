
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import { processTitleWithAI } from '../_shared/deepseekUtils.ts';
import { fetchLaptopData } from './oxylabsService.ts';
import { saveProductUpdate } from './databaseService.ts';
import { UpdateLaptopsRequest } from './types.ts';

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
    const { laptops } = await req.json() as UpdateLaptopsRequest;
    console.log(`Processing ${laptops.length} laptops for updates`);

    // Process laptops in parallel with AI
    const updateProcess = async () => {
      for (const laptop of laptops) {
        try {
          console.log(`Fetching data for laptop ${laptop.id}`);
          const productData = await fetchLaptopData(laptop.asin);
          
          if (!productData) {
            console.log(`No data found for laptop ${laptop.id}`);
            continue;
          }

          // Process with DeepSeek AI
          console.log(`Processing laptop ${laptop.id} with DeepSeek AI`);
          const aiProcessedData = await processTitleWithAI(
            productData.title,
            productData.description,
            DEEPSEEK_API_KEY!
          );

          // Merge AI processed data with product data
          const updatedData = {
            ...productData,
            ...aiProcessedData,
            ai_processing_status: 'completed',
            ai_processed_at: new Date().toISOString()
          };

          await saveProductUpdate(laptop.id, updatedData);
          console.log(`Successfully updated laptop ${laptop.id}`);
        } catch (error) {
          console.error(`Error updating laptop ${laptop.id}:`, error);
          // Update status to error but continue with other laptops
          await supabase
            .from('products')
            .update({ 
              update_status: 'error',
              last_checked: new Date().toISOString()
            })
            .eq('id', laptop.id);
        }
      }
    };

    // Use waitUntil to handle the updates in the background
    EdgeRuntime.waitUntil(updateProcess());

    return new Response(
      JSON.stringify({ message: 'Update process started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


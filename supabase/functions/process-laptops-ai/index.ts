
import { corsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { extractGPTResponse, getGPTForProduct } from "../_shared/deepseekUtils.ts";

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { laptops, focus = 'all' } = await req.json();
    console.log(`Received request to process ${laptops.length} laptops with focus: ${focus}`);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Process each laptop with the DeepSeek API
    for (const laptop of laptops) {
      console.log(`Processing laptop: ${laptop.title.substring(0, 50)}... (ID: ${laptop.id})`);
      
      try {
        // Get the DeepSeek response for the laptop
        const response = await getGPTForProduct(laptop, focus);
        
        if (!response) {
          console.error(`Failed to get AI response for laptop ${laptop.id}`);
          continue;
        }
        
        // Extract structured data from the response
        const extractedData = extractGPTResponse(response, focus);
        
        // Additional filtering for short graphics strings when focus is on graphics
        if (focus === 'graphics' && extractedData.graphics) {
          // If graphics string is too short (less than 5 chars), treat it as null
          if (extractedData.graphics.length < 5) {
            console.log(`Graphics value too short (${extractedData.graphics}), requesting better data`);
            // You could attempt to reprocess or mark for further processing
          }
        }
        
        // Update the laptop with the extracted data
        const { error: updateError } = await supabaseClient
          .from('products')
          .update({
            ...extractedData,
            ai_processing_status: 'completed',
            ai_processed_at: new Date().toISOString()
          })
          .eq('id', laptop.id);
        
        if (updateError) {
          console.error(`Error updating laptop ${laptop.id}:`, updateError);
        } else {
          console.log(`Successfully updated laptop ${laptop.id}`);
        }
      } catch (error) {
        console.error(`Error processing laptop ${laptop.id}:`, error);
        
        // Mark as failed
        await supabaseClient
          .from('products')
          .update({
            ai_processing_status: 'failed'
          })
          .eq('id', laptop.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Started processing ${laptops.length} laptops` }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in process-laptops-ai function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

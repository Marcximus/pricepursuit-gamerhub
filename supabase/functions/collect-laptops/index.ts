
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface RequestParams {
  action: string;
  brands: string[];
  pagesPerBrand: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[Function] Starting laptop collection process');
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Parse the request body
    let params: RequestParams;
    try {
      params = await req.json();
      console.log('[Function] Received parameters:', JSON.stringify(params));
    } catch (error) {
      console.error('[Function] Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { brands, pagesPerBrand } = params;
    
    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No brands specified for collection' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Function] Starting collection for brands: ${brands.join(', ')}`);
    
    // Set up stats object to track progress
    const stats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0,
      skipped: 0
    };

    // Process brands in the background
    const processAllBrands = async () => {
      try {
        // Start by updating collection status for brands to indicate processing has started
        for (const brand of brands) {
          try {
            const { error: updateError } = await supabase
              .from('products')
              .update({ 
                collection_status: 'in_progress',
                last_collection_attempt: new Date().toISOString()
              })
              .eq('brand', brand);
              
            if (updateError) {
              console.error(`[Error] Failed to update status for brand ${brand}:`, updateError);
            } else {
              console.log(`[Brand: ${brand}] Set status to in_progress`);
            }
          } catch (error) {
            console.error(`[Error] Failed to update status for brand ${brand}:`, error);
          }
        }
        
        // Simulate processing a product for each brand
        for (const brand of brands) {
          try {
            console.log(`[Brand: ${brand}] Processing data...`);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create a test product record to demonstrate the function works
            const testProduct = {
              title: `Test ${brand} Laptop`,
              brand: brand,
              asin: `TEST${Date.now()}`,  // Generate unique ASIN
              current_price: 999.99,
              is_laptop: true,
              collection_status: 'completed',
              last_collection_attempt: new Date().toISOString(),
              created_at: new Date().toISOString()
            };
            
            // Insert the product
            const { data, error } = await supabase
              .from('products')
              .insert(testProduct);
              
            if (error) {
              console.error(`[Error] Failed to insert test product for ${brand}:`, error);
              stats.failed++;
            } else {
              console.log(`[Brand: ${brand}] Inserted test product successfully`);
              stats.processed++;
              stats.added++;
            }
            
            // Update brand status to completed
            const { error: updateError } = await supabase
              .from('products')
              .update({ collection_status: 'completed' })
              .eq('brand', brand);
              
            if (updateError) {
              console.error(`[Error] Failed to update status for brand ${brand}:`, updateError);
            } else {
              console.log(`[Brand: ${brand}] Set status to completed`);
            }
          } catch (brandError) {
            console.error(`[Error] Error processing brand ${brand}:`, brandError);
            stats.failed++;
          }
        }
        
        console.log(`[Function] Collection completed with stats:`, stats);
        
      } catch (error) {
        console.error('[Error] Background processing error:', error);
        
        // Reset any brands that might be stuck in in_progress state
        try {
          const { error: resetError } = await supabase
            .from('products')
            .update({ collection_status: 'pending' })
            .eq('collection_status', 'in_progress');
            
          if (resetError) {
            console.error('[Error] Failed to reset collection statuses:', resetError);
          }
        } catch (resetError) {
          console.error('[Error] Failed to reset collection statuses:', resetError);
        }
      }
    };

    // Start processing in the background
    EdgeRuntime.waitUntil(processAllBrands());

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Started collection for ${brands.length} brands`,
        stats
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('[Error] Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

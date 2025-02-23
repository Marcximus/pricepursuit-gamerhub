
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { fetchLaptopData } from './oxylabsService.ts'
import { processWithDeepseek } from './deepseekService.ts'
import { upsertProduct } from './databaseService.ts'
import { corsHeaders } from './cors.ts'

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
    const { brands, current_page } = await req.json();

    console.log(`[Function] Processing page ${current_page} for brands: ${brands.join(', ')}`);

    // Process brands in the background
    const processAllBrands = async () => {
      for (const brand of brands) {
        try {
          // Fetch data for this specific page
          const oxylabsData = await fetchLaptopData(brand, current_page);
          
          if (!oxylabsData.results?.[0]?.content?.results) {
            console.warn(`[Oxylabs] No results found for ${brand} on page ${current_page}`);
            continue;
          }

          const results = [
            ...(oxylabsData.results[0].content.results.paid || []),
            ...(oxylabsData.results[0].content.results.organic || [])
          ];

          console.log(`[Function] Processing ${results.length} results for ${brand} page ${current_page}`);

          for (const result of results) {
            if (!result.asin) {
              console.warn('[Validation] Skipping result without ASIN');
              continue;
            }

            try {
              const processedData = await processWithDeepseek(result);
              await upsertProduct(supabase, result, processedData);
            } catch (productError) {
              console.error(`[Error] Processing product ${result.asin}:`, productError);
              continue;
            }
          }

        } catch (brandError) {
          console.error(`[Error] Processing brand ${brand} page ${current_page}:`, brandError);
          continue;
        }
      }
    };

    // Start processing in the background
    EdgeRuntime.waitUntil(processAllBrands());

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Started processing page ${current_page} for brands: ${brands.join(', ')}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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


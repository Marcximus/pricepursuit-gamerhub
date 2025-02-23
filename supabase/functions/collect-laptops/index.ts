
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
    const { brands, pages_per_brand } = await req.json();

    console.log(`[Function] Processing brands: ${brands.join(', ')}`);

    // Process each brand in the background
    const processAllBrands = async () => {
      for (const brand of brands) {
        console.log(`[Function] Processing brand: ${brand}`);
        
        try {
          for (let page = 1; page <= pages_per_brand; page++) {
            // Step 1: Fetch data from Oxylabs
            const oxylabsData = await fetchLaptopData(brand, page);
            
            if (!oxylabsData.results?.[0]?.content?.results) {
              console.warn(`[Oxylabs] No results found for ${brand} on page ${page}`);
              continue;
            }

            const results = [
              ...(oxylabsData.results[0].content.results.paid || []),
              ...(oxylabsData.results[0].content.results.organic || [])
            ];

            for (const result of results) {
              if (!result.asin) {
                console.warn('[Validation] Skipping result without ASIN');
                continue;
              }

              try {
                // Step 2: Process with DeepSeek
                const processedData = await processWithDeepseek(result);
                
                // Step 3: Update database
                await upsertProduct(supabase, result, processedData);
              } catch (productError) {
                console.error(`[Error] Processing product ${result.asin}:`, productError);
                continue;
              }
            }

            // Add a small delay between pages to prevent rate limiting
            if (page < pages_per_brand) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (brandError) {
          console.error(`[Error] Processing brand ${brand}:`, brandError);
          continue;
        }
      }
    };

    // Start processing in the background
    EdgeRuntime.waitUntil(processAllBrands());

    return new Response(
      JSON.stringify({ success: true, message: 'Collection process started' }),
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

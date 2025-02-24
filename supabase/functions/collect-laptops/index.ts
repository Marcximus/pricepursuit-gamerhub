
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { fetchLaptopData } from './oxylabsService.ts'
import { upsertProduct } from './databaseService.ts'
import { corsHeaders } from './cors.ts'

interface ProcessingStats {
  processed: number;
  updated: number;
  added: number;
  failed: number;
}

serve(async (req) => {
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

    const stats: ProcessingStats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0
    };

    // Process brands in the background
    const processAllBrands = async () => {
      for (const brand of brands) {
        try {
          console.log(`[Brand: ${brand}] Starting collection for page ${current_page}`);
          
          // Get existing ASINs for this brand to track updates vs new additions
          const { data: existingProducts } = await supabase
            .from('products')
            .select('asin')
            .eq('brand', brand);
          
          const existingAsins = new Set(existingProducts?.map(p => p.asin) || []);
          console.log(`[Brand: ${brand}] Found ${existingAsins.size} existing products`);

          // Fetch data for this specific page
          const oxylabsData = await fetchLaptopData(
            brand, 
            current_page,
            Deno.env.get('OXYLABS_USERNAME')!,
            Deno.env.get('OXYLABS_PASSWORD')!
          );
          
          if (!oxylabsData.results?.[0]?.content?.results) {
            console.warn(`[Brand: ${brand}] No results found on page ${current_page}`);
            continue;
          }

          const results = [
            ...(oxylabsData.results[0].content.results.paid || []),
            ...(oxylabsData.results[0].content.results.organic || [])
          ];

          console.log(`[Brand: ${brand}] Processing ${results.length} results from page ${current_page}`);

          for (const result of results) {
            try {
              stats.processed++;
              
              if (!result.asin) {
                console.warn('[Validation] Skipping result without ASIN');
                stats.failed++;
                continue;
              }

              const isNewProduct = !existingAsins.has(result.asin);
              console.log(`[Product: ${result.asin}] Processing ${isNewProduct ? 'new' : 'existing'} product`);

              // Process laptop data directly from Oxylabs response
              const processedData = {
                asin: result.asin,
                title: result.title || null,
                current_price: result.price || null,
                original_price: result.price_strikethrough || null,
                rating: result.rating || null,
                rating_count: result.reviews_count || null,
                image_url: result.url_image || null,
                product_url: result.url || null,
                brand: brand,
                collection_status: 'completed',
                last_checked: new Date().toISOString(),
                is_laptop: true
              };

              await upsertProduct(supabase, result, processedData);
              
              if (isNewProduct) {
                stats.added++;
                console.log(`[Product: ${result.asin}] Added new product: "${result.title?.substring(0, 50)}..."`);
              } else {
                stats.updated++;
                console.log(`[Product: ${result.asin}] Updated existing product`);
              }

            } catch (productError) {
              console.error(`[Error] Processing product ${result.asin}:`, productError);
              stats.failed++;
              continue;
            }
          }

          console.log(`[Brand: ${brand}] Completed page ${current_page}. Stats:`, {
            processed: stats.processed,
            added: stats.added,
            updated: stats.updated,
            failed: stats.failed
          });

        } catch (brandError) {
          console.error(`[Error] Processing brand ${brand} page ${current_page}:`, brandError);
          continue;
        }
      }

      console.log('[Function] Final collection statistics:', stats);
    };

    // Start processing in the background
    EdgeRuntime.waitUntil(processAllBrands());

    // Return immediate response with tracking ID
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Started processing page ${current_page} for brands: ${brands.join(', ')}`,
        stats: stats
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

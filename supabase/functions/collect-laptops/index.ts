
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from './cors.ts';
import { CollectLaptopsRequest } from './types.ts';
import { fetchBrandData } from './oxylabsService.ts';
import { saveProduct } from './databaseService.ts';
import { processProducts } from './productProcessor.ts';
import { processTitleWithAI } from '../_shared/deepseekUtils.ts';

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { 
      brands, 
      pages_per_brand = 2,
      batch_number,
      total_batches 
    } = requestData as CollectLaptopsRequest;

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing brands parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting batch ${batch_number}/${total_batches} for brands: ${brands.join(', ')}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabaseClient
      .from('products')
      .update({ collection_status: 'in_progress' })
      .eq('is_laptop', true)
      .in('brand', brands);

    const collectionTask = async () => {
      let totalProcessed = 0;
      let totalSaved = 0;
      const errors = [];

      for (const brand of brands) {
        console.log(`\n=== Processing brand: ${brand} ===`);
        
        try {
          const results = await fetchBrandData(brand, pages_per_brand);
          
          for (const pageResult of results) {
            const products = processProducts(pageResult, brand);
            console.log(`Processing ${products.length} products from page ${pageResult.content.page}`);

            for (const product of products) {
              try {
                // Process with DeepSeek AI using the full OxyLabs response
                console.log(`Processing product ${product.asin} with DeepSeek AI`);
                const rawProduct = pageResult.content.results.find(
                  (r: any) => r.asin === product.asin
                );
                
                if (!rawProduct) {
                  console.error(`Could not find raw product data for ASIN ${product.asin}`);
                  continue;
                }

                const aiProcessedData = await processTitleWithAI(
                  rawProduct,
                  DEEPSEEK_API_KEY!
                );

                // Merge AI processed data with product data
                const enrichedProduct = {
                  ...product,
                  ...aiProcessedData,
                  ai_processing_status: 'completed',
                  ai_processed_at: new Date().toISOString()
                };

                await saveProduct(enrichedProduct);
                totalSaved++;
                totalProcessed++;
              } catch (error) {
                console.error(`Failed to save product ${product.asin}:`, error);
                errors.push({ brand, asin: product.asin, error: error.message });
                continue;
              }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
          }

        } catch (brandError) {
          console.error(`Error processing brand ${brand}:`, brandError);
          errors.push({ brand, error: brandError.message });
          continue;
        }

        await supabaseClient
          .from('products')
          .update({ collection_status: 'completed' })
          .eq('brand', brand);
      }

      console.log(`\n=== Batch ${batch_number}/${total_batches} Complete ===`);
      console.log({
        totalProcessed,
        totalSaved,
        errorCount: errors.length,
        brandsProcessed: brands.length
      });

      if (errors.length > 0) {
        console.error('Collection errors:', errors);
      }
    };

    EdgeRuntime.waitUntil(collectionTask());

    return new Response(
      JSON.stringify({ 
        message: `Started collection for batch ${batch_number}/${total_batches}`,
        brands: brands.length,
        pages_per_brand
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Critical error in collect-laptops:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

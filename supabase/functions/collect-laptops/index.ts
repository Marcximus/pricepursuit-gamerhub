
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { CollectLaptopsRequest } from './types.ts';
import { fetchBrandData } from './oxylabsService.ts';
import { saveProduct } from './databaseService.ts';
import { processProducts } from './productProcessor.ts';

const PAGES_BATCH_SIZE = 2; // Process pages in smaller batches
const PRODUCTS_BATCH_SIZE = 5; // Process products in smaller batches
const DELAY_BETWEEN_BRANDS = 3000; // 3 seconds delay between brands
const DELAY_BETWEEN_PAGES = 1000; // 1 second delay between pages

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { brands, pages_per_brand = 3 } = requestData as CollectLaptopsRequest;

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      console.error('Invalid or missing brands array in request:', requestData);
      return new Response(
        JSON.stringify({ error: 'Invalid or missing brands parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting collection for ${brands.length} brands, ${pages_per_brand} pages each`);

    // Background task to collect laptops
    const backgroundTask = async () => {
      let totalProcessed = 0;
      let totalSaved = 0;

      for (const brand of brands) {
        console.log(`\n=== Processing brand: ${brand} ===`);
        
        try {
          // Process pages in batches
          for (let pageStart = 1; pageStart <= pages_per_brand; pageStart += PAGES_BATCH_SIZE) {
            const pagesInBatch = Math.min(PAGES_BATCH_SIZE, pages_per_brand - pageStart + 1);
            console.log(`Processing pages ${pageStart} to ${pageStart + pagesInBatch - 1} for ${brand}`);

            const results = await fetchBrandData(brand, pagesInBatch, pageStart);
            
            for (const pageResult of results) {
              const products = processProducts(pageResult, brand);
              console.log(`Processing ${products.length} products from page ${pageResult.content.page}`);

              // Process products in smaller batches
              for (let i = 0; i < products.length; i += PRODUCTS_BATCH_SIZE) {
                const productsBatch = products.slice(i, i + PRODUCTS_BATCH_SIZE);
                
                for (const product of productsBatch) {
                  try {
                    await saveProduct(product);
                    totalSaved++;
                  } catch (error) {
                    console.error(`Failed to save product ${product.asin}:`, error);
                    continue;
                  }
                  totalProcessed++;
                }

                // Add delay between product batches
                if (i + PRODUCTS_BATCH_SIZE < products.length) {
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              }

              // Add delay between pages
              await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PAGES));
            }
          }

          // Add delay between brands
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BRANDS));

        } catch (brandError) {
          console.error(`Error processing brand ${brand}:`, brandError);
          continue; // Continue with next brand even if current one fails
        }
      }

      console.log('\n=== Collection Process Summary ===');
      console.log({
        totalProcessed,
        totalSaved,
        totalSkipped: totalProcessed - totalSaved,
        brandsProcessed: brands.length,
        pagesPerBrand: pages_per_brand
      });
    };

    // Start the background task
    EdgeRuntime.waitUntil(backgroundTask());

    return new Response(
      JSON.stringify({ 
        message: 'Laptop collection started',
        details: {
          brands: brands.length,
          pagesPerBrand: pages_per_brand
        }
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

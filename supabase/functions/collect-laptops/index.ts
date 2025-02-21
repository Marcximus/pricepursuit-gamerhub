
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { CollectLaptopsRequest } from './types.ts';
import { fetchBrandData } from './oxylabsService.ts';
import { saveProduct } from './databaseService.ts';
import { processProducts } from './productProcessor.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { brands, pages_per_brand = 3 } = requestData as CollectLaptopsRequest;

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing brands parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting collection for ${brands.length} brands, ${pages_per_brand} pages each`);

    // Define the main collection task
    const collectionTask = async () => {
      let totalProcessed = 0;
      let totalSaved = 0;

      for (const brand of brands) {
        console.log(`\n=== Processing brand: ${brand} ===`);
        
        try {
          const results = await fetchBrandData(brand, pages_per_brand);
          
          for (const pageResult of results) {
            const products = processProducts(pageResult, brand);
            console.log(`Processing ${products.length} products from page ${pageResult.content.page}`);

            for (const product of products) {
              try {
                await saveProduct(product);
                totalSaved++;
                totalProcessed++;
              } catch (error) {
                console.error(`Failed to save product ${product.asin}:`, error);
                continue;
              }
            }
          }

        } catch (brandError) {
          console.error(`Error processing brand ${brand}:`, brandError);
          continue;
        }
      }

      console.log('\n=== Collection Process Complete ===');
      console.log({
        totalProcessed,
        totalSaved,
        brandsProcessed: brands.length,
        pagesPerBrand: pages_per_brand
      });
    };

    // Ensure the function runs to completion using waitUntil
    EdgeRuntime.waitUntil(collectionTask());

    // Return immediate response while collection continues in background
    return new Response(
      JSON.stringify({ 
        message: 'Laptop collection started in background',
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

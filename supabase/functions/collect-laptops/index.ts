
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './cors.ts';
import { CollectLaptopsRequest } from './types.ts';
import { fetchBrandData } from './oxylabsService.ts';
import { saveProduct } from './databaseService.ts';
import { processProducts } from './productProcessor.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request
    const requestData = await req.json();
    const { brands, pages_per_brand = 5 } = requestData as CollectLaptopsRequest;

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      console.error('Invalid or missing brands array in request:', requestData);
      return new Response(
        JSON.stringify({ error: 'Invalid or missing brands parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting collection for ${brands.length} brands, ${pages_per_brand} pages each`);

    // Background task to collect laptops
    EdgeRuntime.waitUntil((async () => {
      let totalProcessed = 0;
      let totalSaved = 0;

      for (const brand of brands) {
        console.log(`\n=== Starting collection for brand: ${brand} ===`);
        
        try {
          const results = await fetchBrandData(brand, pages_per_brand);
          
          console.log('Received Oxylabs response for brand:', brand, {
            resultsLength: results.length,
            firstResultContent: results[0]?.content ? 'present' : 'missing'
          });

          for (const pageResult of results) {
            const products = processProducts(pageResult, brand);
            console.log(`Processing page results for ${brand}:`, {
              pageNumber: pageResult.content.page,
              productsFound: products.length
            });

            for (const product of products) {
              try {
                await saveProduct(product);
                totalSaved++;
              } catch (error) {
                console.error(`Failed to save product ${product.asin}:`, error);
                continue;
              }
              totalProcessed++;
            }
          }

          // Add delay between brands to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (brandError) {
          console.error(`Error processing brand ${brand}:`, {
            error: brandError.message,
            stack: brandError.stack
          });
          continue;
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
    })());

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
    console.error('Critical error in collect-laptops:', {
      error: error.message,
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

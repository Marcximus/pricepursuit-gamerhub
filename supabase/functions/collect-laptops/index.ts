
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

interface CollectLaptopsRequest {
  brands: string[];
  pages_per_brand: number;
  batch_number: number;
  total_batches: number;
}

interface OxylabsResult {
  results: {
    content: {
      results?: {
        paid?: any[];
        organic?: any[];
      };
    };
  }[];
}

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')!;
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { brands, pages_per_brand, batch_number, total_batches } = await req.json() as CollectLaptopsRequest;

    console.log(`Processing batch ${batch_number}/${total_batches} for brands:`, brands);

    for (const brand of brands) {
      console.log(`Collecting data for brand: ${brand}`);
      
      try {
        // Fetch laptop data from Oxylabs
        const laptopData = [];
        const collectionErrors = [];

        for (let page = 1; page <= pages_per_brand; page++) {
          console.log(`Fetching page ${page} for ${brand}`);
          
          const payload = {
            source: "amazon_search",
            domain: "com",
            query: `${brand} laptop`,
            start_page: page,
            pages: 1,
            parse: true,
          };

          const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
          }

          const data: OxylabsResult = await response.json();
          
          console.log(`Response structure for ${brand} page ${page}:`, {
            hasResults: !!data.results,
            firstResultContent: data.results?.[0]?.content,
            resultsStructure: data.results?.[0]?.content?.results ? Object.keys(data.results[0].content.results) : 'no results'
          });

          // Process results if they exist
          if (data.results?.[0]?.content?.results) {
            const pageResults = [
              ...(data.results[0].content.results.paid || []),
              ...(data.results[0].content.results.organic || [])
            ];

            // Process each result
            for (const result of pageResults) {
              if (!result.asin) continue;

              try {
                const productData = {
                  asin: result.asin,
                  title: result.title || '',
                  current_price: typeof result.price === 'number' ? result.price : null,
                  original_price: typeof result.price_strikethrough === 'number' ? result.price_strikethrough : null,
                  rating: typeof result.rating === 'number' ? result.rating : null,
                  rating_count: typeof result.reviews_count === 'number' ? result.reviews_count : null,
                  image_url: result.url_image || '',
                  product_url: result.url || '',
                  is_laptop: true,
                  brand: brand,
                  collection_status: 'completed',
                  last_checked: new Date().toISOString(),
                  last_collection_attempt: new Date().toISOString()
                };

                laptopData.push(productData);
              } catch (resultError) {
                console.error(`Error processing result for ${brand} ASIN ${result.asin}:`, resultError);
                collectionErrors.push({
                  brand,
                  asin: result.asin,
                  error: resultError.message
                });
              }
            }
          } else {
            console.warn(`No results found for ${brand} on page ${page}`);
          }
        }

        // Upsert collected data
        if (laptopData.length > 0) {
          const { error: upsertError } = await supabase
            .from('products')
            .upsert(laptopData, {
              onConflict: 'asin',
              ignoreDuplicates: false
            });

          if (upsertError) {
            throw upsertError;
          }

          console.log(`Successfully saved ${laptopData.length} products for ${brand}`);
        } else {
          console.warn(`No valid products found for brand ${brand}`);
        }

        // Log collection errors if any
        if (collectionErrors.length > 0) {
          console.error(`Collection errors:`, collectionErrors);
        }

      } catch (brandError) {
        console.error(`Error processing brand ${brand}:`, brandError);
        throw brandError;
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SEARCH_QUERIES = [
  'laptop',
  'gaming laptop',
  'business laptop',
  'ultrabook',
  'notebook computer'
];

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function searchLaptops(query: string, page: number, username: string, password: string) {
  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    },
    body: JSON.stringify({
      source: 'amazon_search',
      query: query,
      geo_location: '90210',
      start_page: page.toString(),
      pages: '1',
      parse: true,
      context: [
        {
          key: 'department',
          value: 'computers-laptops'
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results[0]?.content?.results?.organic || [];
}

async function processLaptopResults(results: any[]) {
  for (const result of results) {
    if (!result.asin) continue;

    // Check if laptop already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('asin', result.asin)
      .single();

    if (existing) {
      console.log(`Laptop ${result.asin} already exists, skipping...`);
      continue;
    }

    // Insert new laptop
    const { error } = await supabase
      .from('products')
      .insert({
        asin: result.asin,
        title: result.title,
        current_price: result.price?.current || 0,
        original_price: result.price?.previous || result.price?.current || 0,
        rating: result.rating || 0,
        rating_count: result.ratings_total || 0,
        image_url: result.image,
        product_url: result.url,
        is_laptop: true,
        last_checked: new Date().toISOString()
      });

    if (error) {
      console.error(`Error inserting laptop ${result.asin}:`, error);
    } else {
      console.log(`Successfully added laptop ${result.asin}`);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    let totalProcessed = 0;
    const errors: string[] = [];

    // Process each search query
    for (const query of SEARCH_QUERIES) {
      try {
        console.log(`Processing search query: ${query}`);
        
        // Search first 5 pages for each query
        for (let page = 1; page <= 5; page++) {
          console.log(`Processing page ${page} for query "${query}"`);
          
          const results = await searchLaptops(query, page, username, password);
          await processLaptopResults(results);
          
          totalProcessed += results.length;
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
        errors.push(`${query}: ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalProcessed,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in collect-laptops function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});

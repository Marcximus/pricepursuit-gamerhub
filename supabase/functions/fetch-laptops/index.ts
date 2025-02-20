
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define more specific laptop categories
const LAPTOP_CATEGORIES = [
  {
    query: 'traditional laptops',
    pages: 3,
    source: 'amazon_search'
  },
  {
    query: '2-in-1 laptops',
    pages: 2,
    source: 'amazon_search'
  },
  {
    query: 'gaming laptops',
    pages: 3,
    source: 'amazon_search'
  },
  {
    query: 'ultrabook laptops',
    pages: 2,
    source: 'amazon_search'
  },
  {
    query: 'business laptops',
    pages: 2,
    source: 'amazon_search'
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check credentials
    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      console.error('Oxylabs credentials missing');
      throw new Error('Oxylabs credentials not configured')
    }

    // Check existing data first
    const { data: existingLaptops, error: dbError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch existing laptops from database')
    }

    const needsFresh = !existingLaptops || 
                      existingLaptops.length === 0 || 
                      existingLaptops.some(laptop => {
                        const lastChecked = new Date(laptop.last_checked);
                        return (new Date().getTime() - lastChecked.getTime()) > 24 * 60 * 60 * 1000;
                      });

    if (!needsFresh && existingLaptops.length > 0) {
      console.log('Returning existing laptops from database');
      return new Response(
        JSON.stringify(existingLaptops),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Starting fresh laptop catalog build...')
    
    let allLaptops: any[] = [];
    const processedAsins = new Set<string>();

    // Process each category
    for (const category of LAPTOP_CATEGORIES) {
      try {
        console.log(`Processing category: ${category.query}`);
        
        for (let page = 1; page <= category.pages; page++) {
          console.log(`Fetching page ${page} of ${category.query}...`);
          
          const searchResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
            },
            body: JSON.stringify({
              source: category.source,
              query: category.query,
              domain: 'com',
              geo_location: 'United States',
              locale: 'en_US',
              start_page: page.toString(),
              pages: 1,
              parse: true
            })
          })

          if (!searchResponse.ok) {
            console.error(`Error fetching ${category.query} page ${page}:`, searchResponse.status);
            continue;
          }

          const searchData = await searchResponse.json();
          
          if (!searchData?.results?.[0]?.content?.results) {
            console.error(`No results found for ${category.query} page ${page}`);
            break; // Exit pagination if no results found
          }

          const pageResults = searchData.results[0].content.results;
          console.log(`Found ${pageResults.length} results on page ${page}`);

          // Process each product
          const categoryLaptops = pageResults
            .filter((item: any) => {
              if (!item.asin || !item.price?.current || processedAsins.has(item.asin)) {
                return false;
              }
              processedAsins.add(item.asin);
              return true;
            })
            .map((item: any) => ({
              asin: item.asin,
              title: item.title || '',
              current_price: parseFloat(item.price.current.replace(/[^0-9.]/g, '')) || 0,
              original_price: parseFloat((item.price.previous || item.price.current).replace(/[^0-9.]/g, '')) || 0,
              rating: parseFloat(item.rating) || 0,
              rating_count: parseInt(item.ratings_total) || 0,
              image_url: item.image || '',
              product_url: item.url || '',
              category: category.query.split(' ')[0],
              is_laptop: true,
              last_checked: new Date().toISOString()
            }));

          allLaptops = [...allLaptops, ...categoryLaptops];
          console.log(`Added ${categoryLaptops.length} new laptops from ${category.query} page ${page}`);
          
          // Implement a small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing category ${category.query}:`, error);
        continue;
      }
    }

    if (allLaptops.length === 0) {
      if (existingLaptops && existingLaptops.length > 0) {
        return new Response(
          JSON.stringify(existingLaptops),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw new Error('No laptop data found')
    }

    console.log(`Found ${allLaptops.length} total unique laptops`);

    // Update database
    const { error: upsertError } = await supabaseAdmin
      .from('products')
      .upsert(allLaptops)

    if (upsertError) {
      console.error('Error upserting laptops:', upsertError);
      if (existingLaptops && existingLaptops.length > 0) {
        return new Response(
          JSON.stringify(existingLaptops),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw upsertError;
    }

    // Get final data
    const { data: finalLaptops, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    if (fetchError) {
      console.error('Error fetching final laptops:', fetchError);
      return new Response(
        JSON.stringify(allLaptops),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(finalLaptops || allLaptops),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

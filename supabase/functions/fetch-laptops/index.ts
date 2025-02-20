
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LAPTOP_QUERIES = [
  'gaming laptops',
  'business laptops',
  'ultrabook laptops',
  'student laptops'
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check existing data first
    const { data: existingLaptops } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true })

    const needsFresh = !existingLaptops || 
                      existingLaptops.length === 0 || 
                      existingLaptops.some(laptop => {
                        const lastChecked = new Date(laptop.last_checked);
                        return (new Date().getTime() - lastChecked.getTime()) > 24 * 60 * 60 * 1000;
                      });

    if (!needsFresh && existingLaptops && existingLaptops.length > 0) {
      console.log('Returning existing laptops from database');
      return new Response(
        JSON.stringify(existingLaptops),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const oxyUsername = Deno.env.get('OXYLABS_USERNAME')
    const oxyPassword = Deno.env.get('OXYLABS_PASSWORD')

    if (!oxyUsername || !oxyPassword) {
      throw new Error('Oxylabs credentials not configured')
    }

    console.log('Fetching fresh laptop data...')
    
    let allLaptops: any[] = [];

    // Fetch laptops for each query category
    for (const query of LAPTOP_QUERIES) {
      console.log(`Fetching ${query}...`);
      
      const searchResponse = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${oxyUsername}:${oxyPassword}`)
        },
        body: JSON.stringify({
          source: 'amazon_search',
          query,
          domain: 'com',
          geo_location: 'United States',
          locale: 'en_US',
          start_page: '1',
          pages: 2,
          parse: true
        })
      })

      if (!searchResponse.ok) {
        console.error(`Error fetching ${query}:`, searchResponse.status);
        continue;
      }

      const searchData = await searchResponse.json();
      
      if (!searchData?.results?.[0]?.content?.results) {
        console.error(`No results found for ${query}`);
        continue;
      }

      const categoryLaptops = searchData.results[0].content.results
        .filter((item: any) => (
          item.asin && 
          item.price?.current &&
          !allLaptops.some(l => l.asin === item.asin) // Avoid duplicates
        ))
        .map((item: any) => {
          const specs = extractSpecs(item.title);
          return {
            asin: item.asin,
            title: item.title || '',
            current_price: parseFloat(item.price.current.replace(/[^0-9.]/g, '')) || 0,
            original_price: parseFloat((item.price.previous || item.price.current).replace(/[^0-9.]/g, '')) || 0,
            rating: parseFloat(item.rating) || 0,
            rating_count: parseInt(item.ratings_total) || 0,
            image_url: item.image || '',
            product_url: item.url || '',
            category: query.split(' ')[0], // 'gaming', 'business', etc.
            is_laptop: true,
            last_checked: new Date().toISOString()
          };
        });

      allLaptops = [...allLaptops, ...categoryLaptops];
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

    console.log(`Found ${allLaptops.length} total laptops`);

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

// Helper function to extract specs from title
function extractSpecs(title: string): { [key: string]: string } {
  const specs: { [key: string]: string } = {};
  
  // Common laptop specs patterns
  const patterns = {
    cpu: /(i[3579]|ryzen|celeron|pentium)[\s-]?\d{4,5}[A-Za-z]*/i,
    ram: /(\d+)\s*(gb|gigabyte|g)\s*(ram|memory)/i,
    storage: /(\d+)\s*(gb|tb|gigabyte|terabyte)\s*(ssd|hdd|storage)/i,
    screen: /(\d+\.?\d*)"|\s(\d+\.?\d*)\sinch/i
  };

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = title.match(pattern);
    if (match) {
      specs[key] = match[0].trim();
    }
  }

  return specs;
}

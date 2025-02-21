
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte'
]

const DELAY_BETWEEN_REQUESTS = 2000 // 2 seconds between requests to avoid rate limits

async function searchLaptopsByBrand(brand: string, pageNum: number = 1) {
  console.log(`Searching for ${brand} laptops on page ${pageNum}...`)
  
  const payload = {
    source: 'amazon_search',
    query: `${brand} laptop`,
    domain: 'com',
    geo_location: '90210',
    start_page: pageNum.toString(),
    pages: '1',
    parse: true
  }

  try {
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.results[0].content.results
  } catch (error) {
    console.error(`Error searching for ${brand} laptops:`, error)
    return []
  }
}

async function updateDatabase(laptops: any[]) {
  for (const laptop of laptops) {
    try {
      // Check if laptop already exists
      const { data: existing } = await supabase
        .from('products')
        .select('id, asin, current_price, image_url')
        .eq('asin', laptop.asin)
        .maybeSingle()

      const laptopData = {
        asin: laptop.asin,
        title: laptop.title,
        current_price: parseFloat(laptop.price?.value || '0'),
        original_price: parseFloat(laptop.price?.original_price || '0') || null,
        rating: parseFloat(laptop.rating || '0'),
        rating_count: parseInt(laptop.reviews?.rating_count || '0'),
        image_url: laptop.image?.url,
        product_url: laptop.url,
        is_laptop: true,
        collection_status: 'completed',
        last_checked: new Date().toISOString(),
        last_collection_attempt: new Date().toISOString()
      }

      if (existing) {
        // Update only if we have new information
        const updates: any = {}
        if (!existing.current_price && laptopData.current_price) {
          updates.current_price = laptopData.current_price
        }
        if (!existing.image_url && laptopData.image_url) {
          updates.image_url = laptopData.image_url
        }
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('products')
            .update(updates)
            .eq('id', existing.id)
        }
      } else {
        // Insert new laptop
        await supabase
          .from('products')
          .insert([laptopData])
      }
    } catch (error) {
      console.error('Error updating database:', error)
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { force_refresh = false } = await req.json()

    // Start the collection process in the background
    EdgeRuntime.waitUntil((async () => {
      console.log('Starting laptop collection...')

      for (const brand of LAPTOP_BRANDS) {
        try {
          // Search first 3 pages for each brand
          for (let page = 1; page <= 3; page++) {
            const laptops = await searchLaptopsByBrand(brand, page)
            if (laptops && laptops.length > 0) {
              await updateDatabase(laptops)
            }
            // Delay between requests to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
          }
        } catch (error) {
          console.error(`Error processing ${brand}:`, error)
          continue // Continue with next brand even if one fails
        }
      }

      console.log('Laptop collection completed')
    })())

    return new Response(
      JSON.stringify({ message: 'Laptop collection started' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

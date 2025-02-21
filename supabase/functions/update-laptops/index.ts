
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME')
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface Laptop {
  id: string;
  asin: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const { laptops } = await req.json()

    console.log(`Starting update process for ${laptops.length} laptops...`)

    // Process laptops one by one with a 1-second delay
    for (const laptop of laptops) {
      console.log(`Processing laptop ${laptop.asin}...`)

      try {
        // Update status to in_progress for this specific laptop
        await supabase
          .from('products')
          .update({ update_status: 'in_progress' })
          .eq('id', laptop.id)

        // Make request to Oxylabs API
        const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
          },
          body: JSON.stringify({
            source: 'amazon_product',
            query: laptop.asin,
            domain: 'com',
            geo_location: '90210',
            parse: true
          })
        })

        if (!response.ok) {
          throw new Error(`Oxylabs API error: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`Got Oxylabs response for ${laptop.asin}:`, data)

        // Update product in database with ALL information
        const { error: updateError } = await supabase
          .from('products')
          .update({
            title: data.results[0].content.title,
            description: data.results[0].content.description,
            current_price: data.results[0].content.price?.current,
            original_price: data.results[0].content.price?.previous,
            rating: data.results[0].content.rating,
            rating_count: data.results[0].content.rating_breakdown?.total_count,
            image_url: data.results[0].content.images?.[0],
            review_data: data.results[0].content.reviews,
            processor: data.results[0].content.specifications?.processor,
            ram: data.results[0].content.specifications?.ram,
            storage: data.results[0].content.specifications?.storage,
            graphics: data.results[0].content.specifications?.graphics,
            screen_size: data.results[0].content.specifications?.screen_size,
            screen_resolution: data.results[0].content.specifications?.screen_resolution,
            weight: data.results[0].content.specifications?.weight,
            battery_life: data.results[0].content.specifications?.battery_life,
            update_status: 'completed',
            last_checked: new Date().toISOString(),
            last_updated: new Date().toISOString()
          })
          .eq('id', laptop.id)

        if (updateError) {
          throw updateError
        }

        // Wait 1 second before processing next laptop
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing laptop ${laptop.asin}:`, error)
        
        // Update status to error for this specific laptop
        await supabase
          .from('products')
          .update({ 
            update_status: 'error',
            last_checked: new Date().toISOString()
          })
          .eq('id', laptop.id)
      }
    }

    return new Response(
      JSON.stringify({ message: `Completed processing ${laptops.length} laptops` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in update-laptops function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


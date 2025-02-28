
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { LaptopUpdateRequest, UpdateResponse } from './types.ts'
import { fetchLaptopData } from './oxylabsService.ts'
import { updateLaptopInDatabase } from './databaseService.ts'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { laptops } = await req.json() as LaptopUpdateRequest

    if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid request. Please provide an array of laptops to update.'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    console.log(`Received update request for ${laptops.length} laptops`)
    
    // Process each laptop in the background
    EdgeRuntime.waitUntil(processLaptops(laptops))

    // Return immediate success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Started updating ${laptops.length} laptops. This will be processed in the background.`,
        count: laptops.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error processing request',
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})

// Background processing function
async function processLaptops(laptops: any[]) {
  console.log(`Starting background process for ${laptops.length} laptops`)
  
  const results = {
    updated: [] as any[],
    failed: [] as any[]
  }
  
  // Process each laptop sequentially to avoid rate limiting
  for (const laptop of laptops) {
    try {
      console.log(`Processing laptop: ${laptop.asin} (ID: ${laptop.id})`)
      
      // Fetch latest data from Amazon
      const laptopData = await fetchLaptopData(laptop.asin)
      
      if (!laptopData) {
        console.error(`Failed to fetch data for ASIN ${laptop.asin}`)
        results.failed.push({
          id: laptop.id,
          asin: laptop.asin,
          error: 'Failed to fetch product data'
        })
        continue
      }
      
      // Update the database with the new data
      const updateResult = await updateLaptopInDatabase(laptop.id, laptopData)
      
      if (updateResult.success) {
        console.log(`Successfully updated laptop: ${laptop.asin}`)
        results.updated.push({
          id: laptop.id,
          asin: laptop.asin,
          success: true
        })
      } else {
        console.error(`Failed to update laptop ${laptop.asin} in database: ${updateResult.message}`)
        results.failed.push({
          id: laptop.id,
          asin: laptop.asin,
          error: updateResult.error || 'Unknown error'
        })
      }
      
      // Add a short delay between requests to avoid hitting rate limits
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(`Error processing laptop ${laptop.asin}:`, error)
      results.failed.push({
        id: laptop.id,
        asin: laptop.asin,
        error: error.message
      })
    }
  }
  
  // Log final results
  const totalProcessed = results.updated.length + results.failed.length
  console.log(`Background processing completed. Total: ${totalProcessed}, Success: ${results.updated.length}, Failed: ${results.failed.length}`)
  
  return results
}

// Handle shutdown events
addEventListener('beforeunload', (ev) => {
  console.log('Function shutdown due to:', ev.detail?.reason)
})

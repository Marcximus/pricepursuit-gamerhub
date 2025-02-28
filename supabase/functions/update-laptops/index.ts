
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { LaptopUpdateRequest, UpdateResponse } from './types.ts'
import { fetchLaptopData } from './oxylabsService.ts'
import { updateLaptopInDatabase } from './databaseService.ts'

// CORS headers for browser requests
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
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Parse request body
    const requestData: LaptopUpdateRequest = await req.json()
    
    if (!requestData.laptops || !Array.isArray(requestData.laptops) || requestData.laptops.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Expected "laptops" array.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    console.log(`Processing update request for ${requestData.laptops.length} laptops`)

    // Initialize results tracking
    const results = {
      updated: [] as Array<{id: string; asin: string; success: boolean; message?: string}>,
      failed: [] as Array<{id: string; asin: string; error: string}>
    }

    // Process each laptop sequentially
    for (const laptop of requestData.laptops) {
      try {
        console.log(`Updating data for laptop ${laptop.id} (ASIN: ${laptop.asin})`)
        
        // Fetch latest data from Amazon
        const laptopData = await fetchLaptopData(laptop.asin)
        
        if (!laptopData) {
          console.error(`Failed to fetch data for laptop ${laptop.id} (ASIN: ${laptop.asin})`)
          results.failed.push({
            id: laptop.id,
            asin: laptop.asin,
            error: 'Failed to fetch product data from Amazon'
          })
          continue
        }
        
        // Prepare data for update
        const updateData = {
          ...laptopData,
          // Override with any specific values from the request
          current_price: laptop.current_price !== undefined ? laptop.current_price : laptopData.current_price,
          title: laptop.title || laptopData.title
        }
        
        // Update the laptop record in the database
        const updateResult = await updateLaptopInDatabase(laptop.id, updateData)
        
        if (updateResult.success) {
          results.updated.push({
            id: laptop.id,
            asin: laptop.asin,
            success: true,
            message: updateResult.message
          })
        } else {
          results.failed.push({
            id: laptop.id,
            asin: laptop.asin,
            error: updateResult.error || 'Unknown error'
          })
        }
      } catch (error) {
        console.error(`Error processing laptop ${laptop.id}:`, error)
        results.failed.push({
          id: laptop.id,
          asin: laptop.asin,
          error: error.message || 'Unknown error'
        })
      }
    }

    // Prepare the response
    const response: UpdateResponse = {
      success: results.updated.length > 0,
      message: `Updated ${results.updated.length} laptops. Failed: ${results.failed.length}`,
      updatedCount: results.updated.length,
      failedCount: results.failed.length,
      results
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  } catch (error) {
    console.error('Error processing update request:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fetchLaptopData } from './oxylabsService.ts';
import { updateLaptop } from './databaseService.ts';
import { LaptopUpdateRequest, UpdateResponse } from './types.ts';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse request body
    const requestData = await req.json() as LaptopUpdateRequest;
    
    if (!requestData.laptops || !Array.isArray(requestData.laptops) || requestData.laptops.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Expected "laptops" array.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`Processing update request for ${requestData.laptops.length} laptops`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize results tracking
    const results = {
      updated: [] as Array<{id: string; asin: string; success: boolean; message?: string}>,
      failed: [] as Array<{id: string; asin: string; error: string}>
    };

    // Process each laptop sequentially
    for (const laptop of requestData.laptops) {
      try {
        console.log(`Updating data for laptop ${laptop.id} (ASIN: ${laptop.asin})`);
        
        // Fetch latest data from Amazon
        const laptopData = await fetchLaptopData(laptop.asin);
        
        if (!laptopData) {
          console.error(`Failed to fetch data for laptop ${laptop.id} (ASIN: ${laptop.asin})`);
          results.failed.push({
            id: laptop.id,
            asin: laptop.asin,
            error: 'Failed to fetch product data from Amazon'
          });
          continue;
        }
        
        // Prepare data for update
        const updateData = {
          id: laptop.id,
          asin: laptop.asin,
          ...laptopData,
          // Override with any specific values from the request if needed
          current_price: laptopData.current_price !== null ? laptopData.current_price : laptop.current_price,
          title: laptopData.title || laptop.title
        };
        
        // Update the laptop record in the database
        const updateResult = await updateLaptop(supabase, updateData);
        
        if (updateResult.success) {
          results.updated.push({
            id: laptop.id,
            asin: laptop.asin,
            success: true,
            message: updateResult.message
          });
        } else {
          results.failed.push({
            id: laptop.id,
            asin: laptop.asin,
            error: updateResult.message || 'Unknown error'
          });
        }
      } catch (error) {
        console.error(`Error processing laptop ${laptop.id}:`, error);
        results.failed.push({
          id: laptop.id,
          asin: laptop.asin,
          error: error.message || 'Unknown error'
        });
      }
    }

    // Prepare the response
    const response: UpdateResponse = {
      success: results.updated.length > 0,
      message: `Updated ${results.updated.length} laptops. Failed: ${results.failed.length}`,
      updatedCount: results.updated.length,
      failedCount: results.failed.length,
      results
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error('Error processing update request:', error);
    
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
    );
  }
});

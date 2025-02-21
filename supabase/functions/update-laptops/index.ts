
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('Initialized Supabase client')

    // Get laptops that need updating (null prices or outdated)
    const { data: laptopsToUpdate, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'')
      .limit(10) // Process in smaller batches

    if (fetchError) {
      console.error('Error fetching laptops to update:', fetchError)
      throw fetchError
    }

    if (!laptopsToUpdate || laptopsToUpdate.length === 0) {
      console.log('No laptops need updating')
      return new Response(
        JSON.stringify({ message: 'No laptops need updating', updated_count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log(`Found ${laptopsToUpdate.length} laptops to update`)

    // Mark laptops as being updated
    await supabase
      .from('products')
      .update({ update_status: 'updating' })
      .in('id', laptopsToUpdate.map(l => l.id))

    return new Response(
      JSON.stringify({ 
        message: 'Update process started', 
        updated_count: laptopsToUpdate.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in update-laptops function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})


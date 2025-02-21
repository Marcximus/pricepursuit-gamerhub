
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BATCH_SIZE = 10;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting laptop update process...');

    // Get laptops that need updating (oldest first, limited to batch size)
    const { data: laptopsToUpdate, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .order('last_updated', { ascending: true, nullsFirst: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      throw fetchError;
    }

    if (!laptopsToUpdate || laptopsToUpdate.length === 0) {
      console.log('No laptops need updating at this time');
      return new Response(
        JSON.stringify({ message: 'No laptops to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${laptopsToUpdate.length} laptops to update`);

    // Update status for selected laptops
    await supabase
      .from('products')
      .update({ update_status: 'updating' })
      .in('id', laptopsToUpdate.map(l => l.id));

    // Call collect-laptops function with the ASINs to update
    const { data: updateResult, error: updateError } = await supabase.functions.invoke('collect-laptops', {
      body: { 
        action: 'update',
        asins: laptopsToUpdate.map(l => l.asin)
      }
    });

    if (updateError) {
      throw updateError;
    }

    console.log('Update process completed successfully');
    
    return new Response(
      JSON.stringify({ 
        message: 'Update process started', 
        updated_count: laptopsToUpdate.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-laptops function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

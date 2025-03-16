
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting scheduled update process...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Update system config to record this scheduled run
    await supabase
      .from('system_config')
      .upsert({ 
        key: 'last_scheduled_update', 
        value: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    // First, check for any stuck updates that might be preventing new ones
    const { data: stuckUpdates, error: stuckError } = await supabase
      .from('products')
      .select('count')
      .eq('is_laptop', true)
      .in('update_status', ['pending_update', 'in_progress'])
      .gte('last_checked', new Date(Date.now() - 30 * 60 * 1000).toISOString());
      
    if (stuckError) {
      console.error('Error checking for stuck updates:', stuckError);
    } else if (stuckUpdates && stuckUpdates[0]?.count > 20) {
      console.log(`Found ${stuckUpdates[0].count} laptops stuck in update state. Resetting them...`);
      
      // Reset any stuck updates that are older than 30 minutes
      await supabase
        .from('products')
        .update({ 
          update_status: 'pending',
          last_checked: new Date().toISOString()
        })
        .eq('is_laptop', true)
        .in('update_status', ['pending_update', 'in_progress'])
        .lt('last_checked', new Date(Date.now() - 30 * 60 * 1000).toISOString());
    }

    // Get laptops that need updating using the same prioritization as updateLaptops.ts
    // 1. Laptops in error state
    // 2. Laptops with missing prices
    // 3. Laptops with missing images
    // 4. Laptops ordered by oldest checked date
    
    // Get error state laptops
    const { data: errorLaptops, error: errorFetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, image_url, last_checked, update_status')
      .eq('is_laptop', true)
      .in('update_status', ['error', 'timeout'])
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(25);
      
    if (errorFetchError) {
      console.error('Error fetching error state laptops:', errorFetchError);
    }
    
    // Get laptops with missing prices
    const { data: missingPriceLaptops, error: priceFetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, image_url, last_checked, update_status')
      .eq('is_laptop', true)
      .is('current_price', null)
      .not('update_status', 'in', ['pending_update', 'in_progress'])
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(25);
      
    if (priceFetchError) {
      console.error('Error fetching laptops with missing prices:', priceFetchError);
    }
    
    // Get laptops with missing images
    const { data: missingImageLaptops, error: imageFetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, image_url, last_checked, update_status')
      .eq('is_laptop', true)
      .is('image_url', null)
      .not('current_price', 'is', null) // Skip those already covered by missing price query
      .not('update_status', 'in', ['pending_update', 'in_progress'])
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(25);
      
    if (imageFetchError) {
      console.error('Error fetching laptops with missing images:', imageFetchError);
    }
    
    // Get laptops that haven't been checked in the last 24 hours
    const { data: oldLaptops, error: oldFetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, image_url, last_checked, update_status')
      .eq('is_laptop', true)
      .lt('last_checked', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .not('update_status', 'in', ['pending_update', 'in_progress'])
      .not('current_price', 'is', null) // Skip those already covered by missing price query
      .not('image_url', 'is', null) // Skip those already covered by missing image query
      .order('last_checked', { ascending: true, nullsFirst: true })
      .limit(25);
      
    if (oldFetchError) {
      console.error('Error fetching old laptops:', oldFetchError);
    }
    
    // Combine and deduplicate the results
    const laptopMap = new Map();
    
    // Add in priority order
    [
      ...(errorLaptops || []),
      ...(missingPriceLaptops || []),
      ...(missingImageLaptops || []),
      ...(oldLaptops || [])
    ].forEach(laptop => {
      if (!laptopMap.has(laptop.id)) {
        laptopMap.set(laptop.id, laptop);
      }
    });
    
    const laptops = Array.from(laptopMap.values());

    if (!laptops || laptops.length === 0) {
      console.log('No laptops need updating at this time');
      return new Response(
        JSON.stringify({ message: 'No laptops to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${laptops.length} laptops to update in the following categories:`);
    console.log(`- Error state: ${errorLaptops?.length || 0}`);
    console.log(`- Missing prices: ${missingPriceLaptops?.length || 0}`);
    console.log(`- Missing images: ${missingImageLaptops?.length || 0}`);
    console.log(`- Not checked in 24h: ${oldLaptops?.length || 0}`);
    
    // Take only the first 10 for a single scheduled batch
    const batchSize = 10;
    const updateBatch = laptops.slice(0, batchSize);
    const laptopIds = updateBatch.map(l => l.id);

    // Mark laptops as pending_update
    const { error: statusError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending_update',
        last_checked: new Date().toISOString()
      })
      .in('id', laptopIds);

    if (statusError) {
      throw new Error(`Failed to update status: ${statusError.message}`);
    }

    // Call the update-laptops function with the selected batch
    const updateProcess = async () => {
      try {
        console.log(`Starting update process for batch of ${updateBatch.length} laptops`);
        
        // Call the update-laptops edge function
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/update-laptops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ laptops: updateBatch })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response from update-laptops: ${response.status} ${errorText}`);
          throw new Error(`Failed to call update-laptops: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Update process completed with result:', result);
        
        // Update system_config with completion time
        await supabase
          .from('system_config')
          .upsert({ 
            key: 'last_completed_update', 
            value: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        return result;
      } catch (error) {
        console.error('Error in update process:', error);
        
        // If there's an error, reset the laptops to pending status
        await supabase
          .from('products')
          .update({ 
            update_status: 'pending',
            last_checked: new Date().toISOString()
          })
          .in('id', laptopIds);
          
        throw error;
      }
    };

    // Use waitUntil to ensure the function runs to completion
    EdgeRuntime.waitUntil(updateProcess());

    return new Response(
      JSON.stringify({ 
        message: `Started update process for ${updateBatch.length} laptops`,
        laptops: laptopIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scheduled update error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

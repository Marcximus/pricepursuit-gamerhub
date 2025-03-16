
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Scheduled Update function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Set up Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log("Checking if auto-update is enabled...");
    
    // Check if auto-update is enabled
    const { data: configData, error: configError } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'auto_update_enabled')
      .single();
    
    if (configError) {
      console.error("Error checking auto-update status:", configError);
      throw configError;
    }
    
    const isEnabled = configData?.value === 'true';
    
    if (!isEnabled) {
      console.log("Auto-update is disabled, skipping scheduled update");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Auto-update is disabled, skipping scheduled update",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log("Auto-update is enabled, updating last scheduled time...");
    
    // Update the last scheduled update timestamp
    await supabase
      .from('system_config')
      .upsert({ 
        key: 'last_scheduled_update', 
        value: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    // Find laptops that need updating
    console.log("Finding laptops that need updating...");
    
    // Prioritize laptops with:
    // 1. No current price (is_laptop=true and current_price is null)
    // 2. No image (is_laptop=true and image_url is null)
    // 3. Oldest checked laptops (is_laptop=true order by last_checked asc)
    // 4. Limit to a batch size to prevent overloading
    const BATCH_SIZE = 5; // Process 5 laptops per scheduled run
    
    // Start with missing prices
    let { data: missingPricesData, error: missingPricesError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .is('current_price', null)
      .limit(BATCH_SIZE);
    
    if (missingPricesError) {
      console.error("Error finding laptops with missing prices:", missingPricesError);
      throw missingPricesError;
    }
    
    let laptopsToUpdate = missingPricesData || [];
    let remainingSlots = BATCH_SIZE - laptopsToUpdate.length;
    
    // If we haven't filled our batch, add laptops with missing images
    if (remainingSlots > 0 && laptopsToUpdate.length < BATCH_SIZE) {
      const { data: missingImagesData, error: missingImagesError } = await supabase
        .from('products')
        .select('id, asin')
        .eq('is_laptop', true)
        .is('image_url', null)
        .not('id', 'in', laptopsToUpdate.map(l => l.id).join(','))
        .limit(remainingSlots);
      
      if (missingImagesError) {
        console.error("Error finding laptops with missing images:", missingImagesError);
      } else if (missingImagesData) {
        laptopsToUpdate = [...laptopsToUpdate, ...missingImagesData];
        remainingSlots = BATCH_SIZE - laptopsToUpdate.length;
      }
    }
    
    // If we still haven't filled our batch, add oldest checked laptops
    if (remainingSlots > 0 && laptopsToUpdate.length < BATCH_SIZE) {
      const { data: oldestCheckedData, error: oldestCheckedError } = await supabase
        .from('products')
        .select('id, asin')
        .eq('is_laptop', true)
        .not('id', 'in', laptopsToUpdate.map(l => l.id).join(','))
        .order('last_checked', { ascending: true, nullsFirst: true })
        .limit(remainingSlots);
      
      if (oldestCheckedError) {
        console.error("Error finding oldest checked laptops:", oldestCheckedError);
      } else if (oldestCheckedData) {
        laptopsToUpdate = [...laptopsToUpdate, ...oldestCheckedData];
      }
    }
    
    if (laptopsToUpdate.length === 0) {
      console.log("No laptops need updating at this time");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No laptops need updating at this time",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Found ${laptopsToUpdate.length} laptops to update:`, laptopsToUpdate);
    
    // Mark these laptops as pending update
    const now = new Date().toISOString();
    for (const laptop of laptopsToUpdate) {
      await supabase
        .from('products')
        .update({ 
          update_status: 'pending_update',
          last_checked: now
        })
        .eq('id', laptop.id);
    }
    
    // Trigger update through the update-laptops function
    console.log("Triggering update-laptops function...");
    
    // Call the update-laptops function to actually do the updates
    const updateResponse = await fetch(
      `${supabaseUrl}/functions/v1/update-laptops`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          laptops: laptopsToUpdate.map(l => ({ id: l.id, asin: l.asin })),
          batchUpdate: true
        })
      }
    );
    
    if (!updateResponse.ok) {
      throw new Error(`Failed to call update-laptops: ${updateResponse.status} ${updateResponse.statusText}`);
    }
    
    const updateResult = await updateResponse.json();
    
    console.log("Update triggered successfully:", updateResult);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scheduled update triggered for ${laptopsToUpdate.length} laptops`,
        laptops: laptopsToUpdate.length,
        updateResult
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in scheduled-update function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

console.log("Toggle Scheduler function started");

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
    
    // Handle GET request to check status
    if (req.method === "GET") {
      console.log("GET request received - checking current status");
      
      // Get current state from system_config
      const { data: enabledData, error: enabledError } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'auto_update_enabled')
        .single();
        
      if (enabledError) {
        console.error("Error fetching auto_update_enabled:", enabledError);
        throw enabledError;
      }
      
      const { data: lastScheduledData, error: lastScheduledError } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'last_scheduled_update')
        .single();
      
      const isEnabled = enabledData?.value === 'true';
      console.log("Current auto-update status:", isEnabled);
        
      return new Response(
        JSON.stringify({
          enabled: isEnabled,
          lastScheduled: lastScheduledError ? null : lastScheduledData?.value,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    // Parse the request body for POST requests
    const requestData = await req.json();
    const enabled = requestData.enabled === true;
    const updateLastScheduledTime = requestData.updateLastScheduledTime === true;
    
    console.log(`Request to ${enabled ? 'enable' : 'disable'} the laptop update scheduler`);
    
    // Update system_config auto_update_enabled flag
    const { error: updateError } = await supabase
      .from('system_config')
      .upsert({ 
        key: 'auto_update_enabled', 
        value: enabled ? 'true' : 'false',
        updated_at: new Date().toISOString()
      });
      
    if (updateError) {
      console.error("Error updating auto_update_enabled:", updateError);
      throw updateError;
    }
    
    // If enabling or explicitly requested, also update the last_scheduled_update timestamp
    if (enabled || updateLastScheduledTime) {
      const now = new Date().toISOString();
      console.log("Updating last_scheduled_update to:", now);
      
      const { error: timestampError } = await supabase
        .from('system_config')
        .upsert({ 
          key: 'last_scheduled_update', 
          value: now,
          updated_at: now
        });
        
      if (timestampError) {
        console.error("Error updating last_scheduled_update:", timestampError);
        throw timestampError;
      }
    }
    
    // Call PostgreSQL function to create or remove the cron job based on enabled state
    if (enabled) {
      // Call the database function to create the scheduler
      const { data: cronData, error: cronError } = await supabase.rpc('create_laptop_update_schedule');
      if (cronError) {
        console.error("Error creating cron job:", cronError);
      } else {
        console.log("Cron job created:", cronData);
      }
    } else {
      // Call the database function to remove the scheduler
      const { data: cronData, error: cronError } = await supabase.rpc('remove_laptop_update_schedule');
      if (cronError) {
        console.error("Error removing cron job:", cronError);
      } else {
        console.log("Cron job removed:", cronData);
      }
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Laptop update scheduler has been ${enabled ? 'enabled' : 'disabled'}`,
        enabled: enabled
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in toggle-scheduler function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

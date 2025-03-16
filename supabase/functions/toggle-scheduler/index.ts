
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
    
    // Parse the request body
    const { enabled } = await req.json();
    
    console.log(`Request to ${enabled ? 'enable' : 'disable'} the laptop update scheduler`);
    
    // Check if pg_cron extension is enabled
    const { data: extCheck, error: extError } = await supabase.rpc('check_extension_exists', { 
      extension_name: 'pg_cron'
    });
    
    if (extError) {
      console.error("Error checking for pg_cron extension:", extError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to check for required extensions: " + extError.message,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (!extCheck) {
      console.error("pg_cron extension is not available");
      return new Response(
        JSON.stringify({
          success: false,
          error: "The pg_cron extension is not available. Please contact your database administrator.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Toggle scheduler status
    if (enabled) {
      // Enable the scheduler: Create or update the cron job
      const { data: cronData, error: cronError } = await supabase.rpc('create_laptop_update_schedule');
      
      if (cronError) {
        console.error("Error creating cron job:", cronError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to create cron job: " + cronError.message,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log("Successfully enabled laptop update scheduler:", cronData);
      
      // Update system_config
      await supabase
        .from('system_config')
        .upsert([
          { 
            key: 'auto_update_enabled', 
            value: 'true',
            updated_at: new Date().toISOString()
          },
          { 
            key: 'last_scheduled_update', 
            value: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        
    } else {
      // Disable the scheduler: Remove the cron job
      const { data: cronData, error: cronError } = await supabase.rpc('remove_laptop_update_schedule');
      
      if (cronError) {
        console.error("Error removing cron job:", cronError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to remove cron job: " + cronError.message,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      console.log("Successfully disabled laptop update scheduler:", cronData);
      
      // Update system_config
      await supabase
        .from('system_config')
        .upsert({ 
          key: 'auto_update_enabled', 
          value: 'false',
          updated_at: new Date().toISOString()
        });
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Laptop update scheduler has been ${enabled ? 'enabled' : 'disabled'}`,
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

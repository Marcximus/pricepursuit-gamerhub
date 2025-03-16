
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
    
    // Update system_config auto_update_enabled flag
    await supabase
      .from('system_config')
      .upsert({ 
        key: 'auto_update_enabled', 
        value: enabled ? 'true' : 'false',
        updated_at: new Date().toISOString()
      });
    
    if (enabled) {
      // If enabling, also update the last_scheduled_update timestamp
      await supabase
        .from('system_config')
        .upsert({ 
          key: 'last_scheduled_update', 
          value: new Date().toISOString(),
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

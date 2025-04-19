
import { createClient } from '@supabase/supabase-js'
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Safely stringify objects without circular reference issues
 */
function safeStringify(obj: any): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    return `[Error stringifying object: ${error.message}]`;
  }
}

/**
 * Log memory usage for debugging
 */
function logMemoryUsage() {
  try {
    const memoryUsage = Deno.memoryUsage();
    console.log("🧠 Memory usage:", {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    });
  } catch (error) {
    console.error("⚠️ Error logging memory usage:", error);
  }
}

serve(async (req) => {
  console.log("🚀 fetch-product function started");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("👌 Handling CORS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("📦 Parsing request body");
    const requestText = await req.text();
    console.log(`📥 Raw request data: ${requestText}`);
    
    let requestData;
    try {
      requestData = JSON.parse(requestText);
      console.log(`📥 Parsed request data: ${safeStringify(requestData)}`);
    } catch (error) {
      console.error("🔴 Error parsing request JSON:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { asin } = requestData;

    if (!asin) {
      console.error("🔴 Missing ASIN parameter");
      return new Response(
        JSON.stringify({ error: 'ASIN is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Processing request for ASIN: ${asin}`);
    
    const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
    const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!OXYLABS_USERNAME || !OXYLABS_PASSWORD) {
      console.error("🔐 Missing Oxylabs credentials");
      return new Response(
        JSON.stringify({ error: 'Oxylabs credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("🔑 Credentials validated");

    // Create Supabase client
    console.log(`📊 Creating Supabase client with URL: ${SUPABASE_URL?.substring(0, 20)}...`);
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

    // Structure payload for Oxylabs
    const payload = {
      source: 'amazon_product',
      query: asin,
      domain: 'com',
      geo_location: '90210',
      parse: true
    };

    console.log(`📤 Sending request to Oxylabs with payload: ${safeStringify(payload)}`);

    // Add timeout for Oxylabs request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      // Make request to Oxylabs
      const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`📥 Oxylabs response status: ${response.status}`);
      
      // Check for non-JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        const errorText = await response.text();
        console.error(`❌ Oxylabs returned non-JSON response: ${contentType}`);
        console.error(`❌ Response body: ${errorText.substring(0, 1000)}...`);
        throw new Error(`Oxylabs returned non-JSON response: ${contentType}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Oxylabs API error: ${response.status} - ${errorText}`);
        throw new Error(`Oxylabs API error: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log(`📥 Oxylabs response length: ${responseText.length} characters`);
      console.log(`📥 Oxylabs response preview: ${responseText.substring(0, 500)}...`);
      
      const data = JSON.parse(responseText);
      console.log("✅ Successfully parsed Oxylabs response");

      if (!data.results || !data.results[0] || !data.results[0].content) {
        console.error("❌ Invalid response structure from Oxylabs");
        console.error(`❌ Received data: ${safeStringify(data)}`);
        throw new Error('Invalid response from Oxylabs');
      }

      const productData = data.results[0].content;
      console.log(`✅ Product data for ASIN ${asin} received`);
      console.log(`📦 Product data structure: ${JSON.stringify({
        hasTitle: !!productData.title,
        hasPrice: !!productData.price,
        hasRating: !!(productData.rating && productData.rating.rating),
        hasImages: !!(productData.images && productData.images.length > 0),
        specifications: Object.keys(productData.specifications || {})
      }, null, 2)}`);

      // Update product in database
      console.log(`📝 Updating product in database for ASIN: ${asin}`);
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({
          title: productData.title,
          current_price: productData.price?.current,
          original_price: productData.price?.before_price || productData.price?.current,
          rating: productData.rating?.rating || null,
          rating_count: productData.rating?.rating_count || null,
          image_url: productData.images?.[0] || null,
          product_url: productData.url,
          last_checked: new Date().toISOString(),
          processor: productData.specifications?.processor,
          ram: productData.specifications?.ram,
          storage: productData.specifications?.storage,
          screen_size: productData.specifications?.screen_size,
          graphics: productData.specifications?.graphics,
          weight: productData.specifications?.weight,
          battery_life: productData.specifications?.battery_life
        })
        .eq('asin', asin)
        .select()
        .single();

      if (updateError) {
        console.error(`❌ Error updating product in database: ${updateError.message}`);
        console.error(`❌ Full error: ${safeStringify(updateError)}`);
        throw updateError;
      }

      console.log(`✅ Successfully updated product in database for ASIN: ${asin}`);
      console.log(`✅ Updated fields: ${safeStringify(updatedProduct)}`);
      
      // Log memory usage before returning
      logMemoryUsage();

      return new Response(
        JSON.stringify(updatedProduct),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('⏱️ Oxylabs request timed out after 60 seconds');
        throw new Error('Oxylabs request timed out after 60 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error(`💥 Error in fetch-product function: ${error.message}`);
    console.error(`💥 Error stack: ${error.stack || 'No stack trace available'}`);
    
    // Try to extract more information from the error
    let errorDetails = 'Unknown error details';
    try {
      errorDetails = safeStringify(error);
    } catch (stringifyError) {
      errorDetails = `Error stringifying error: ${stringifyError.message}`;
    }
    
    console.error(`💥 Full error details: ${errorDetails}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: errorDetails
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})

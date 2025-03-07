
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OXYLABS_USERNAME = Deno.env.get("OXYLABS_USERNAME");
const OXYLABS_PASSWORD = Deno.env.get("OXYLABS_PASSWORD");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OXYLABS_USERNAME || !OXYLABS_PASSWORD) {
      throw new Error("Oxylabs credentials not configured");
    }

    // Extract the request data
    const { asin } = await req.json();

    if (!asin) {
      return new Response(
        JSON.stringify({ error: "ASIN is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching product data for ASIN: ${asin}`);
    
    // Structure payload for Oxylabs
    const payload = {
      source: 'amazon_product',
      query: asin,
      domain: 'com',
      geo_location: '90210',
      parse: true
    };

    // Make request to Oxylabs
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Oxylabs API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.results || !data.results[0] || !data.results[0].content) {
      throw new Error('Invalid response from Oxylabs');
    }

    const productData = data.results[0].content;
    
    // Extract relevant information for a review blog post
    const processedData = {
      title: productData.title,
      brand: productData.brand,
      price: productData.price,
      rating: productData.rating,
      images: productData.images,
      features: productData.feature_bullets,
      description: productData.description,
      specifications: productData.specifications || {},
      asin: asin,
      url: `https://www.amazon.com/dp/${asin}`
    };

    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching product data:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

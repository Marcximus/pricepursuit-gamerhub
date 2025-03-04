
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')!;
const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';

serve(async (req) => {
  console.log("🔍 Fetch Product Details function started!");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { asins } = await req.json();
    
    if (!asins || !asins.length) {
      throw new Error('No ASINs provided');
    }
    
    console.log(`📦 Fetching details for ASINs: ${asins.join(', ')}`);

    const url = `https://${RAPIDAPI_HOST}/product-details?asin=${encodeURIComponent(asins.join(','))}&country=US`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ RapidAPI error (${response.status}): ${errorText}`);
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Successfully fetched product details');
    
    // Process the data to extract the relevant information
    const processedData = Array.isArray(data) 
      ? data.map(processProductData) 
      : processProductData(data);
    
    return new Response(
      JSON.stringify(processedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in fetch-product-details function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function processProductData(data: any) {
  if (!data || !data.data) {
    return null;
  }
  
  const productData = data.data;
  const details = productData.product_details || {};
  const information = productData.product_information || {};
  
  // Extract and normalize the relevant fields
  return {
    asin: productData.asin,
    title: productData.product_title,
    os: information.OS || details.OS || null,
    processor: details.CPU_Model || information["CPU Model"] || null,
    ram: information.RAM || details.RAM || null,
    storage: information["Memory Storage Capacity"] || details["Memory Storage Capacity"] || null,
    screen_size: information["Standing screen display size"] || details["Standing screen display size"] || null,
    screen_resolution: information.Resolution || details.Resolution || null,
    graphics: information["Graphics Coprocessor"] || details["Graphics Coprocessor"] || null,
    weight: information["Item Weight"] || details["Item Weight"] || null,
    battery: information["Battery Power Rating"] || details["Battery Power Rating"] || null,
    // Additional information that might be useful
    additional_info: {
      "Wireless communication technologies": information["Wireless communication technologies"] || null,
      "Connectivity technologies": information["Connectivity technologies"] || null,
      "Special features": information["Special features"] || null,
      "Audio": information.Audio || null,
      "Keyboard": information.Keyboard || null,
      "Backlit Keyboard": information["Backlit Keyboard"] || null,
      "Webcam": information.Webcam || null,
      "USB": information.USB || null,
      "HDMI": information.HDMI || null,
      "Thunderbolt": information.Thunderbolt || null,
      "Battery Life": information["Battery Life"] || null
    },
    details: details,
    information: information
  };
}

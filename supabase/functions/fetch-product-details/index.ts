
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')!;

serve(async (req) => {
  console.log("🔍 Fetch Product Details function started");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("👌 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { asins } = await req.json();
    
    if (!asins || !Array.isArray(asins) || asins.length === 0) {
      throw new Error('Missing or invalid ASINs');
    }
    
    console.log(`📦 Fetching details for ASINs: ${asins.join(', ')}`);
    
    // Create the path with query parameters for multiple ASINs
    const asinParam = asins.join('%2C');
    const path = `/product-details?asin=${asinParam}&country=US`;
    
    // Make the request to RapidAPI
    const response = await fetch(`https://real-time-amazon-data.p.rapidapi.com${path}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ RapidAPI error: ${response.status}`, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched product details');
    
    // Process and extract the most important information
    const result = processProductDetails(data, asins);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
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

// Process product details and extract the most valuable information
function processProductDetails(apiResponse: any, requestedAsins: string[]) {
  console.log('🧹 Processing product details');
  
  // If only one product was requested
  if (requestedAsins.length === 1 && apiResponse.data) {
    return {
      [apiResponse.data.asin]: extractProductSpecs(apiResponse.data)
    };
  }
  
  // Handle multiple products (assuming the response format changes for multiple ASINs)
  const result: Record<string, any> = {};
  
  // The API might return results in different structures for multiple products
  // Handling both possible response formats
  if (Array.isArray(apiResponse.data)) {
    // Handle array response
    apiResponse.data.forEach((product: any) => {
      if (product.asin) {
        result[product.asin] = extractProductSpecs(product);
      }
    });
  } else if (apiResponse.data && typeof apiResponse.data === 'object') {
    // If it's just a single object inside data
    if (apiResponse.data.asin) {
      result[apiResponse.data.asin] = extractProductSpecs(apiResponse.data);
    } else {
      // Check if each property is a product
      for (const key in apiResponse.data) {
        const product = apiResponse.data[key];
        if (product && product.asin) {
          result[product.asin] = extractProductSpecs(product);
        }
      }
    }
  }
  
  // Check if we have results for all requested ASINs
  const missingAsins = requestedAsins.filter(asin => !result[asin]);
  if (missingAsins.length > 0) {
    console.warn(`⚠️ Missing data for ASINs: ${missingAsins.join(', ')}`);
  }
  
  return result;
}

// Extract the most important specifications from a product
function extractProductSpecs(product: any) {
  const specs: Record<string, any> = {};
  
  // Basic information
  specs.title = product.product_title || '';
  specs.price = product.product_price || '';
  specs.rating = product.product_star_rating || '';
  specs.rating_count = product.product_num_ratings || 0;
  specs.url = product.product_url || '';
  specs.image = product.product_photo || '';
  
  // Extract detailed specifications
  if (product.product_details) {
    specs.details = product.product_details;
  }
  
  // Extract from product information if available
  if (product.product_information) {
    const info = product.product_information;
    specs.ram = info.RAM || info['Ram Memory Installed Size'] || info['Memory Storage Capacity'] || '';
    specs.processor = info['Processor'] || info['CPU Model'] || info['Processor Brand'] || '';
    specs.storage = info['Storage'] || info['Memory Storage Capacity'] || info['Hard Disk Size'] || '';
    specs.graphics = info['Graphics'] || info['Graphics Coprocessor'] || info['Graphics Card Description'] || '';
    specs.screen_size = info['Screen Size'] || info['Standing screen display size'] || '';
    specs.screen_resolution = info['Resolution'] || info['Scanner Resolution'] || info['Display Resolution Maximum'] || '';
    specs.weight = info['Weight'] || info['Item Weight'] || '';
    specs.battery = info['Battery Power Rating'] || info['Battery Life'] || '';
    specs.os = info['OS'] || info['Operating System'] || '';
    specs.brand = info['Brand'] || '';
    specs.model = info['Item model number'] || info['Model Name'] || '';
    
    // Add all other information that might be useful
    specs.additional_info = {};
    for (const key in info) {
      if (!['RAM', 'Processor', 'Storage', 'Graphics', 'Screen Size', 
            'Resolution', 'Weight', 'OS', 'Brand', 'Item model number', 
            'Model Name'].includes(key)) {
        specs.additional_info[key] = info[key];
      }
    }
  }
  
  // Add product description if available
  if (product.product_description) {
    specs.description = product.product_description;
  }
  
  // Add about product points if available
  if (product.about_product && Array.isArray(product.about_product)) {
    specs.highlights = product.about_product;
  }
  
  return specs;
}


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("🚀 fetch-top10-products function started!");
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("🔑❌ Missing Supabase credentials!");
      throw new Error("Missing Supabase credentials");
    }
    console.log("🔑✅ Supabase credentials validated");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("🔌 Supabase client initialized");
    
    // Extract the request data
    console.log("📦 Extracting request data...");
    const requestJson = await req.json();
    const { searchParams, count = 10 } = requestJson;
    
    console.log(`🔍 Request parameters: count=${count}, searchParams:`, JSON.stringify(searchParams).substring(0, 200));
    
    if (!searchParams || !Array.isArray(searchParams)) {
      console.error("❌ Invalid searchParams:", searchParams);
      return new Response(
        JSON.stringify({ error: "Search parameters are required as an array" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🎯 Fetching top ${count} products for ${searchParams.length} search parameter sets`);
    console.log(`📊 Search parameters details:`, JSON.stringify(searchParams));

    // Prepare search parameters for the database query
    const results = [];
    
    for (const [index, param] of searchParams.entries()) {
      console.log(`🔎 Processing search parameter set #${index + 1}:`, JSON.stringify(param));
      
      // Get the best matching laptops from the database based on the search parameters
      let query = supabase
        .from('products')
        .select(`
          id, asin, title, brand, model, processor, ram, storage, 
          screen_size, screen_resolution, graphics, weight, battery_life,
          current_price, original_price, rating, rating_count, image_url, product_url
        `)
        .eq('is_laptop', true)
        .not('image_url', 'is', null)
        .order('rating', { ascending: false })
        .limit(Math.ceil(count / searchParams.length) + 5); // Extra for filtering

      // Add filters based on the search parameters
      if (param.brand) {
        console.log(`👔 Filtering by brand: "${param.brand}"`);
        query = query.ilike('brand', `%${param.brand}%`);
      }
      
      if (param.processor) {
        console.log(`🧠 Filtering by processor: "${param.processor}"`);
        query = query.ilike('processor', `%${param.processor}%`);
      }
      
      if (param.minPrice) {
        console.log(`💰 Filtering by minimum price: $${param.minPrice}`);
        query = query.gte('current_price', param.minPrice);
      }
      
      if (param.maxPrice) {
        console.log(`💸 Filtering by maximum price: $${param.maxPrice}`);
        query = query.lte('current_price', param.maxPrice);
      }
      
      if (param.ram) {
        console.log(`🧮 Filtering by RAM: "${param.ram}"`);
        query = query.ilike('ram', `%${param.ram}%`);
      }
      
      if (param.storage) {
        console.log(`💾 Filtering by storage: "${param.storage}"`);
        query = query.ilike('storage', `%${param.storage}%`);
      }
      
      if (param.graphics) {
        console.log(`🎮 Filtering by graphics: "${param.graphics}"`);
        query = query.ilike('graphics', `%${param.graphics}%`);
      }

      // Execute the query
      console.log(`🔍 Executing database query for parameter set #${index + 1}`);
      const { data, error } = await query;
      
      if (error) {
        console.error(`❌ Error querying database for set #${index + 1}:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} products for parameter set #${index + 1}`);
        results.push(...data);
      } else {
        console.warn(`⚠️ No products found for parameter set #${index + 1}`);
      }
    }
    
    console.log(`🔄 Total raw results before deduplication: ${results.length} products`);
    
    // Deduplicate based on ASIN
    const uniqueMap = new Map();
    results.forEach(item => uniqueMap.set(item.asin, item));
    const uniqueProducts = Array.from(uniqueMap.values());
    
    console.log(`🧹 After deduplication: ${uniqueProducts.length} unique products`);
    
    // Sort by rating and limit to the requested count
    const topProducts = uniqueProducts
      .sort((a, b) => {
        // Primary sort by rating
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // Secondary sort by rating count
        return (b.rating_count || 0) - (a.rating_count || 0);
      })
      .slice(0, count);
    
    console.log(`🏆 Final top ${topProducts.length} products selected`);
    
    if (topProducts.length > 0) {
      console.log(`📝 Sample product: "${topProducts[0].title.substring(0, 50)}..."`);
      console.log(`⭐ Top product rating: ${topProducts[0].rating} (${topProducts[0].rating_count} reviews)`);
    }
    
    // Format the product data for the blog post
    console.log(`🎨 Formatting products for blog post display`);
    
    const formattedProducts = topProducts.map((product, index) => {
      console.log(`🔄 Formatting product #${index + 1}: ${product.asin}`);
      const specs = [];
      if (product.processor) specs.push(`Processor: ${product.processor}`);
      if (product.ram) specs.push(`RAM: ${product.ram}`);
      if (product.storage) specs.push(`Storage: ${product.storage}`);
      if (product.screen_size) specs.push(`Screen: ${product.screen_size}`);
      if (product.graphics) specs.push(`Graphics: ${product.graphics}`);
      
      console.log(`📊 Product #${index + 1} specs count: ${specs.length}`);
      
      return {
        rank: index + 1,
        id: product.id,
        asin: product.asin,
        title: product.title,
        brand: product.brand,
        model: product.model,
        specs: specs.join(' | '),
        price: product.current_price,
        originalPrice: product.original_price,
        rating: product.rating,
        ratingCount: product.rating_count,
        imageUrl: product.image_url,
        productUrl: product.product_url,
        htmlContent: `
          <div class="product-card">
            <div class="product-image">
              <img src="${product.image_url}" alt="${product.title}" class="rounded-lg w-full">
            </div>
            <div class="product-info">
              <h3 class="text-xl font-semibold">${product.title}</h3>
              <div class="specs text-sm text-gray-600 my-2">
                ${specs.join(' | ')}
              </div>
              <div class="price-rating flex justify-between items-center">
                <div class="price font-bold">${product.current_price ? `$${product.current_price}` : 'Check Price'}</div>
                <div class="rating flex items-center">
                  <span class="stars">★★★★★</span>
                  <span class="rating-text ml-1">${product.rating ? product.rating.toFixed(1) : '-'}/5</span>
                </div>
              </div>
              <a href="${product.product_url}" target="_blank" rel="noopener noreferrer" class="btn-view mt-2 block text-center bg-gaming-600 text-white py-2 px-4 rounded-md">View on Amazon</a>
            </div>
          </div>
        `
      };
    });
    
    console.log(`✅ Successfully formatted ${formattedProducts.length} products`);
    console.log(`📏 HTML content sample length: ${formattedProducts[0]?.htmlContent.length || 0} characters`);
    console.log(`🏁 fetch-top10-products function completed successfully`);
    
    return new Response(
      JSON.stringify({ products: formattedProducts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Error in fetch-top10-products function:', error);
    console.error(`⚠️ Error message: ${error.message || 'Unknown error'}`);
    console.error(`⚠️ Error stack: ${error.stack || 'No stack trace available'}`);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

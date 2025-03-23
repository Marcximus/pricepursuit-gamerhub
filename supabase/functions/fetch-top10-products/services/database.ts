
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Creates and returns a Supabase client instance
 * @returns Configured Supabase client
 */
export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase credentials");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Queries the database for products matching the given search parameters
 * @param supabase Supabase client
 * @param searchParams Array of search parameter objects
 * @param count Maximum number of products to return
 * @returns Array of matched products
 */
export const queryProducts = async (supabase: any, searchParams: any[], count: number) => {
  console.log(`🎯 Fetching top ${count} products for ${searchParams.length} search parameter sets`);
  
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
      console.error(`❌ FULL ERROR:`, JSON.stringify(error));
      continue;
    }
    
    if (data && data.length > 0) {
      console.log(`✅ Found ${data.length} products for parameter set #${index + 1}`);
      console.log(`📥 QUERY RESULTS SAMPLE:`, JSON.stringify(data[0] ? {
        title: data[0].title,
        asin: data[0].asin,
        price: data[0].current_price,
        brand: data[0].brand
      } : {}, null, 2));
      results.push(...data);
    } else {
      console.warn(`⚠️ No products found for parameter set #${index + 1}`);
    }
  }
  
  return results;
};

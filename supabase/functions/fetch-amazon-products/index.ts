
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");

serve(async (req) => {
  console.log("🚀 fetch-amazon-products function started!");
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAPIDAPI_KEY) {
      console.error("🔑❌ ERROR: RAPIDAPI_KEY is not set");
      throw new Error("RAPIDAPI_KEY is not set");
    }
    console.log("🔑✅ RapidAPI key validated");

    // Extract the request data
    console.log("📦 Extracting request data...");
    const requestText = await req.text();
    console.log(`📥 REQUEST DATA: ${requestText}`);
    
    const { query, brand, maxPrice, category } = JSON.parse(requestText);
    console.log(`📝 Search query: "${query}"`);
    console.log(`🏷️ Brand filter: ${brand || 'None'}`);
    console.log(`💰 Max price: ${maxPrice || 'None'}`);
    console.log(`🔍 Category: ${category || 'None'}`);

    // Build the query parameters
    const queryParams: Record<string, string> = {
      query: query,
      page: '1',
      country: 'US',
      sort_by: brand ? 'RELEVANCE' : 'BEST_SELLERS',
      product_condition: 'ALL',
      is_prime: 'false',
      deals_and_discounts: 'NONE'
    };

    // Add optional parameters if provided
    if (brand) {
      queryParams.brand = brand.toUpperCase();
    }
    
    if (maxPrice) {
      queryParams.max_price = maxPrice.toString();
    }

    // Create the request URL with query parameters
    const searchUrl = new URL('https://real-time-amazon-data.p.rapidapi.com/search');
    Object.entries(queryParams).forEach(([key, value]) => {
      searchUrl.searchParams.append(key, value);
    });

    console.log(`🔍 Making request to RapidAPI with URL: ${searchUrl.toString()}`);
    console.log(`📤 RAPIDAPI REQUEST PARAMS: ${JSON.stringify(queryParams)}`);
    
    // Make the request to RapidAPI
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ RapidAPI error: ${response.status} - ${errorText}`);
      throw new Error(`RapidAPI returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`📥 RAPIDAPI RESPONSE RECEIVED - Status: ${response.status}`);
    console.log(`📥 RAPIDAPI RESPONSE PREVIEW: ${JSON.stringify(data).substring(0, 500)}...`);
    
    // Extract and format the product data
    console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
    
    const products = (data.data?.products || []).map((product: any, index: number) => {
      // Determine if this product is a laptop
      const isLaptop = 
        product.title.toLowerCase().includes('laptop') || 
        product.title.toLowerCase().includes('notebook') || 
        (product.categories && product.categories.some((cat: string) => 
          cat.toLowerCase().includes('laptop') || cat.toLowerCase().includes('notebook')));
      
      if (!isLaptop) {
        console.log(`⚠️ Product might not be a laptop: "${product.title}"`);
      }
      
      return {
        rank: index + 1,
        asin: product.asin,
        title: product.title,
        brand: brand || product.brand || 'Unknown',
        price: parseFloat(product.price?.value || '0'),
        rating: parseFloat(product.rating || '0'),
        ratingCount: parseInt(product.ratings_total || '0', 10),
        imageUrl: product.image,
        productUrl: product.url,
        specs: formatSpecs(product),
        htmlContent: generateHtmlContent(product, index + 1)
      };
    });
    
    // Filter out non-laptop products if we have enough products
    const laptopProducts = products.filter((p: any) => 
      p.title.toLowerCase().includes('laptop') || 
      p.title.toLowerCase().includes('notebook'));
    
    const finalProducts = laptopProducts.length >= 5 ? laptopProducts : products;
    
    // Take the top 10 products or all if less than 10
    const top10Products = finalProducts.slice(0, 10);
    
    console.log(`🏁 Returning ${top10Products.length} products`);
    console.log(`📤 FINAL RESPONSE PREVIEW: ${JSON.stringify({ products: top10Products.slice(0, 2) }).substring(0, 500)}...`);

    return new Response(
      JSON.stringify({ products: top10Products }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Error fetching Amazon products:', error);
    console.error(`⚠️ Error message: ${error.message || 'Unknown error'}`);
    console.error(`⚠️ Error stack: ${error.stack || 'No stack trace available'}`);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions
function formatSpecs(product: any): string {
  const specs = [];
  
  // Extract specifications from product data
  if (product.feature_bullets) {
    const features = product.feature_bullets.slice(0, 3);
    for (const feature of features) {
      const cleanFeature = feature
        .replace(/^[•\-\*]\s*/, '')  // Remove bullet points
        .replace(/[\[\]\(\)]/g, '')  // Remove brackets
        .trim();
        
      if (cleanFeature && cleanFeature.length > 5 && cleanFeature.length < 80) {
        specs.push(cleanFeature);
      }
    }
  }
  
  // If we couldn't extract meaningful specs, provide generic ones
  if (specs.length === 0) {
    specs.push("See product details on Amazon");
  }
  
  return specs.join(' | ');
}

function generateHtmlContent(product: any, rank: number): string {
  const title = product.title.trim();
  const price = product.price?.value ? `$${product.price.value}` : 'Check price on Amazon';
  const rating = product.rating ? parseFloat(product.rating).toFixed(1) : '0.0';
  const ratingCount = product.ratings_total || '0';
  const imageUrl = product.image;
  const productUrl = product.url;
  const specs = formatSpecs(product);
  
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${imageUrl}" alt="${title}" class="rounded-lg w-full">
      </div>
      <div class="product-info">
        <h3 class="text-xl font-semibold">${title}</h3>
        <div class="specs text-sm text-gray-600 my-2">
          ${specs}
        </div>
        <div class="price-rating flex justify-between items-center">
          <div class="price font-bold">${price}</div>
          <div class="rating flex items-center">
            <span class="stars">★★★★★</span>
            <span class="rating-text ml-1">${rating}/5</span>
            <span class="rating-count ml-1">(${ratingCount})</span>
          </div>
        </div>
        <a href="${productUrl}" target="_blank" rel="noopener noreferrer" class="btn-view mt-2 block text-center bg-gaming-600 text-white py-2 px-4 rounded-md">View on Amazon</a>
      </div>
    </div>
  `;
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSystemPrompt } from "./promptManager.ts";
import { parseGeneratedContent } from "./contentParser.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  console.log("🚀 generate-blog-post function started!");
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!DEEPSEEK_API_KEY) {
      console.error("🔑❌ ERROR: DEEPSEEK_API_KEY is not set");
      throw new Error("DEEPSEEK_API_KEY is not set");
    }
    console.log("🔑✅ DeepSeek API key validated");

    // Extract the request data
    console.log("📦 Extracting request data...");
    const { prompt, category, asin, asin2 } = await req.json();
    console.log(`📝 User prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
    console.log(`🏷️ Selected category: ${category}`);
    console.log(`🔍 ASIN1: ${asin || 'None provided'}`);
    console.log(`🔍 ASIN2: ${asin2 || 'None provided'}`);

    if (!prompt || !category) {
      console.error("❌ Missing required parameters", { prompt: !!prompt, category: !!category });
      return new Response(
        JSON.stringify({ error: "Prompt and category are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`🎯 Generating ${category} blog post with prompt: "${prompt.substring(0, 30)}..."`);

    // Variables to store product data
    let firstProductData = null;
    let secondProductData = null;

    // Function to fetch product data
    const fetchProductData = async (productAsin: string) => {
      console.log(`🔎 Fetching product data for ASIN: ${productAsin}`);
      try {
        const fetchUrl = `${req.url.split('/generate-blog-post')[0]}/fetch-product-data`;
        console.log(`📡 Making request to: ${fetchUrl}`);
        
        const productResponse = await fetch(fetchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
          },
          body: JSON.stringify({ asin: productAsin }),
        });

        if (!productResponse.ok) {
          console.error(`❌ Error fetching product data: ${productResponse.status}`);
          const errorText = await productResponse.text();
          console.error(`📄 Response: ${errorText}`);
          return null;
        }
        
        const data = await productResponse.json();
        console.log(`✅ Successfully fetched product data: "${data.title.substring(0, 30)}..."`);
        console.log(`💰 Price: ${data.price?.current || 'N/A'}`);
        console.log(`⭐ Rating: ${data.rating?.rating || 'N/A'} (${data.rating?.rating_count || 0} reviews)`);
        return data;
      } catch (error) {
        console.error('💥 Error fetching product data:', error);
        return null;
      }
    };

    // If this is a review and has an ASIN, fetch product data
    if (category === 'Review' && asin) {
      console.log(`📦 Review post with ASIN ${asin}, fetching product data...`);
      firstProductData = await fetchProductData(asin);
      console.log(firstProductData ? `✅ Product data fetched successfully for review` : `❌ Failed to fetch product data for review`);
    }
    
    // If this is a comparison and has two ASINs, fetch both product data
    if (category === 'Comparison' && asin && asin2) {
      console.log(`🔄 Comparison post with ASINs ${asin} and ${asin2}, fetching both products...`);
      firstProductData = await fetchProductData(asin);
      secondProductData = await fetchProductData(asin2);
      console.log(`✅ Product 1 fetch: ${firstProductData ? 'Success' : 'Failed'}`);
      console.log(`✅ Product 2 fetch: ${secondProductData ? 'Success' : 'Failed'}`);
    }
    
    // Create system prompt based on category and product data if available
    console.log(`📝 Generating system prompt for ${category}...`);
    const systemPrompt = getSystemPrompt(category, firstProductData, secondProductData);
    console.log(`📋 System prompt created (${systemPrompt.length} characters)`);
    
    // Generate content using DeepSeek API
    console.log(`🧠 Calling DeepSeek API...`);
    console.log(`🔧 Model: deepseek-chat, Temperature: 1.4`);
    
    const startTime = Date.now();
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 1.4,  // Set to 1.4 for more creative blog content
      }),
    });
    const endTime = Date.now();
    console.log(`⏱️ DeepSeek API call took ${(endTime - startTime) / 1000} seconds`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ DeepSeek API error:', errorData);
      console.error(`🔴 Status code: ${response.status}`);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ DeepSeek API response received`);
    console.log(`📊 Tokens used: ${data.usage?.total_tokens || 'unknown'}`);
    
    const generatedContent = data.choices[0].message.content;
    const contentPreview = generatedContent.substring(0, 100).replace(/\n/g, ' ');
    console.log(`📄 Generated content preview: "${contentPreview}..."`);
    
    // Parse the generated content
    console.log(`🔍 Parsing generated content...`);
    const parsedContent = parseGeneratedContent(generatedContent, category);
    console.log(`✅ Content parsed successfully`);
    console.log(`📑 Title: "${parsedContent.title}"`);
    console.log(`📌 Tags: ${parsedContent.tags?.join(', ') || 'None'}`);
    console.log(`📏 Content length: ${parsedContent.content.length} characters`);
    console.log(`📎 Excerpt length: ${parsedContent.excerpt.length} characters`);
    
    // If we have product data for a review, augment the parsed content
    if (firstProductData && category === 'Review') {
      console.log(`🔄 Augmenting review content with product data`);
      parsedContent.productData = {
        asin,
        title: firstProductData.title,
        brand: firstProductData.brand,
        price: firstProductData.price?.current,
        rating: firstProductData.rating?.rating,
        reviewCount: firstProductData.rating?.rating_count,
        imageUrl: firstProductData.images?.[0],
        productUrl: firstProductData.url
      };
      console.log(`✅ Added product data to review content`);
    }
    
    // If we have product data for a comparison, augment the parsed content
    if (firstProductData && secondProductData && category === 'Comparison') {
      console.log(`🔄 Augmenting comparison content with product data for both products`);
      parsedContent.comparisonData = {
        product1: {
          asin,
          title: firstProductData.title,
          brand: firstProductData.brand,
          price: firstProductData.price?.current,
          rating: firstProductData.rating?.rating,
          reviewCount: firstProductData.rating?.rating_count,
          imageUrl: firstProductData.images?.[0],
          productUrl: firstProductData.url
        },
        product2: {
          asin: asin2,
          title: secondProductData.title,
          brand: secondProductData.brand,
          price: secondProductData.price?.current,
          rating: secondProductData.rating?.rating,
          reviewCount: secondProductData.rating?.rating_count,
          imageUrl: secondProductData.images?.[0],
          productUrl: secondProductData.url
        }
      };
      console.log(`✅ Added comparison data for both products`);
    }
    
    console.log('🎉 Successfully generated blog content!');
    
    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Error generating blog post:', error);
    console.error(`⚠️ Error message: ${error.message || 'Unknown error'}`);
    console.error(`⚠️ Error stack: ${error.stack || 'No stack trace available'}`);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

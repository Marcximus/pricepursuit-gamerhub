
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSystemPrompt } from "./promptManager.ts";
import { parseGeneratedContent } from "./contentParser.ts";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }

    // Extract the request data
    const { prompt, category, asin } = await req.json();

    if (!prompt || !category) {
      return new Response(
        JSON.stringify({ error: "Prompt and category are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Generating ${category} blog post with prompt: ${prompt}${asin ? `, ASIN: ${asin}` : ''}`);

    // If this is a review and has an ASIN, fetch product data
    let productData = null;
    if (category === 'Review' && asin) {
      try {
        // Fetch product data from our edge function
        const productResponse = await fetch(`${req.url.split('/generate-blog-post')[0]}/fetch-product-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': req.headers.get('Authorization') || '',
          },
          body: JSON.stringify({ asin }),
        });

        if (!productResponse.ok) {
          console.error(`Error fetching product data: ${productResponse.status}`);
          const errorText = await productResponse.text();
          console.error(`Response: ${errorText}`);
        } else {
          productData = await productResponse.json();
          console.log('Successfully fetched product data:', productData.title);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        // Continue with generation even if product fetch fails
      }
    }
    
    // Create system prompt based on category and product data if available
    const systemPrompt = getSystemPrompt(category, productData);
    
    // Generate content using DeepSeek API
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse the generated content
    const parsedContent = parseGeneratedContent(generatedContent, category);
    
    // If we have product data, augment the parsed content
    if (productData && category === 'Review') {
      parsedContent.productData = {
        asin,
        title: productData.title,
        brand: productData.brand,
        price: productData.price?.current,
        rating: productData.rating?.rating,
        reviewCount: productData.rating?.rating_count,
        imageUrl: productData.images?.[0],
        productUrl: productData.url
      };
    }
    
    console.log('Successfully generated blog content');
    
    return new Response(
      JSON.stringify(parsedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating blog post:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

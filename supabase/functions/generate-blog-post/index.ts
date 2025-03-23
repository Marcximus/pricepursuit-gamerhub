
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Create corsHeaders outside of the main function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("🚀 generate-blog-post function started!");
  console.log(`📥 Request method: ${req.method}`);
  console.log(`📥 Content-Type: ${req.headers.get('content-type') || 'not set'}`);
  
  // Handle CORS preflight request - THIS IS CRITICAL
  if (req.method === 'OPTIONS') {
    console.log("⚙️ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Just return a mock response for now to verify the function works
    const mockResponse = {
      title: `Top 10 Best Lenovo Laptops for ${new Date().getFullYear()}`,
      content: `<h1>Top 10 Best Lenovo Laptops for ${new Date().getFullYear()}</h1>
        <p>Looking for the best Lenovo laptops on the market? Here's our comprehensive guide to the top 10 Lenovo laptops available today.</p>
        <h2>1. Lenovo ThinkPad X1 Carbon</h2>
        <div class="product-placeholder" data-asin="B07Z36FP7L" data-index="1"></div>
        <ul class="my-4">
          <li>✅ Lightweight and portable design</li>
          <li>✅ Excellent keyboard comfort</li>
          <li>✅ Impressive battery life</li>
        </ul>
        <p>The ThinkPad X1 Carbon remains one of the best business laptops on the market.</p>`,
      excerpt: "Discover the best Lenovo laptops available today with our comprehensive guide, featuring models perfect for business, gaming, and everyday use.",
      category: "Top10",
      tags: ["lenovo", "laptops", "thinkpad", "ideapad", "gaming laptops"]
    };
    
    console.log("✅ Successfully generated mock response");
    
    // Return the response
    return new Response(
      JSON.stringify(mockResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    // Log and return any errors in a consistent format
    console.error(`💥 Error in generate-blog-post: ${error.message}`);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        title: `New Post (Error)`,
        content: `<h1>Error Generating Content</h1><p>There was an error: ${error.message}</p>`,
        excerpt: "There was an error generating this content.",
        category: "Error",
        tags: ["error"]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./cors.ts";
import { processAllBrands } from "./brandProcessor.ts";
import { CollectionStats } from "./types.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brands, pagesPerBrand, startGroupIndex, startBrandIndex, resumeStats, detailedLogging } = await req.json();
    
    console.log('Received collection request with params:', { 
      brandsCount: brands?.length, 
      pagesPerBrand, 
      startGroupIndex, 
      startBrandIndex,
      resumeStats,
      detailedLogging
    });

    if (!brands || !Array.isArray(brands) || brands.length === 0) {
      throw new Error('No brands provided or invalid brands array');
    }

    if (!pagesPerBrand || typeof pagesPerBrand !== 'number' || pagesPerBrand <= 0) {
      throw new Error('Invalid pagesPerBrand parameter');
    }
    
    // Process all brands and collect statistics
    const stats = await processAllBrands(
      brands, 
      pagesPerBrand, 
      startGroupIndex || 0, 
      startBrandIndex || 0, 
      resumeStats || { processed: 0, updated: 0, added: 0, failed: 0, skipped: 0 },
      detailedLogging || false
    );

    return new Response(
      JSON.stringify({
        success: true, 
        stats,
        message: `Processed ${brands.length} brands, ${stats.processed} products`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in collect-laptops function:', error);
    
    return new Response(
      JSON.stringify({
        success: false, 
        error: error.message || 'Unknown error',
        details: error.stack || 'No stack trace available'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

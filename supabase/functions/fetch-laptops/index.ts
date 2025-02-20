
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LAPTOP_ASINS = [
  "B0BSHF7WHH", // Dell XPS
  "B09PTVP3RT", // MacBook Pro
  "B09RBGCX3D", // Lenovo ThinkPad
];

function extractSpecs(title: string, description: string, features: string[]) {
  const specs = {
    processor: '',
    ram: '',
    storage: '',
    screen_size: '',
    screen_resolution: '',
    graphics: ''
  };

  const allText = [title, description, ...(features || [])].join(' ').toLowerCase();

  // Extract processor
  const processorMatches = allText.match(/(?:intel|amd|apple)\s+(?:core\s+)?(?:i[3579]|ryzen|m[12345])\s*(?:-|\s)?(?:\d{4,5}[a-z]{0,2})?/i);
  if (processorMatches) specs.processor = processorMatches[0].trim();

  // Extract RAM
  const ramMatches = allText.match(/(\d{1,3})(?:\s*gb|\s*gigabytes?)\s+(?:of\s+)?(?:ddr[45])?(?:\s+)?ram/i);
  if (ramMatches) specs.ram = ramMatches[0].trim();

  // Extract storage
  const storageMatches = allText.match(/(\d{1,4})(?:\s*gb|\s*tb)(?:\s+)?(?:ssd|hdd|nvme|storage)/i);
  if (storageMatches) specs.storage = storageMatches[0].trim();

  // Extract screen size
  const screenMatches = allText.match(/(\d{2}(?:\.\d)?)[- ]?inch(?:es)?/i);
  if (screenMatches) specs.screen_size = screenMatches[0].trim();

  // Extract resolution
  const resolutionMatches = allText.match(/(\d{3,4}x\d{3,4})|(\d{1,2}k\s+resolution)|(?:full\s+hd|qhd|uhd|wqhd)/i);
  if (resolutionMatches) specs.resolution = resolutionMatches[0].trim();

  // Extract graphics
  const graphicsMatches = allText.match(/(?:nvidia|rtx|gtx|radeon|intel\s+iris|m[12345]\s+pro)/i);
  if (graphicsMatches) specs.graphics = graphicsMatches[0].trim();

  return specs;
}

function estimateProcessorScore(processor: string): number {
  const scoreMap: { [key: string]: number } = {
    'm1': 18000,
    'm2': 20000,
    'm3': 22000,
    'm4': 25000,
    'i9': 30000,
    'i7': 25000,
    'i5': 20000,
    'i3': 15000,
    'ryzen 9': 30000,
    'ryzen 7': 25000,
    'ryzen 5': 20000,
    'ryzen 3': 15000,
  };

  const processorLower = processor.toLowerCase();
  for (const [key, score] of Object.entries(scoreMap)) {
    if (processorLower.includes(key)) {
      return score;
    }
  }
  
  return 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');

    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }

    const laptopPromises = LAPTOP_ASINS.map(async (asin) => {
      const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`)
        },
        body: JSON.stringify({
          source: 'amazon_product',
          query: asin,
          geo_location: '90210',
          parse: true
        })
      });

      if (!response.ok) {
        console.error(`Failed to fetch data for ASIN ${asin}:`, await response.text());
        return null;
      }

      const data = await response.json();
      
      if (!data.results?.[0]?.content) {
        console.error(`No content found for ASIN ${asin}`);
        return null;
      }

      const product = data.results[0].content;
      const specs = extractSpecs(
        product.title,
        product.description,
        product.feature_bullets
      );

      const processorScore = estimateProcessorScore(specs.processor);
      
      return {
        id: asin,
        title: product.title,
        current_price: product.price?.current_price || product.price?.current,
        original_price: product.price?.previous_price || product.price?.previous || product.price?.current,
        rating: product.rating,
        rating_count: product.ratings_total,
        image_url: product.images?.[0],
        product_url: product.url,
        asin: asin,
        processor: specs.processor,
        processor_score: processorScore,
        ram: specs.ram,
        storage: specs.storage,
        screen_size: specs.screen_size,
        screen_resolution: specs.screen_resolution,
        graphics: specs.graphics,
        last_checked: new Date().toISOString()
      };
    });

    const results = await Promise.all(laptopPromises);
    const validResults = results.filter(result => result !== null);

    return new Response(
      JSON.stringify(validResults),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in fetch-laptops function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});

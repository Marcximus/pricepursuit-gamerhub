
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PricingResponse {
  results: Array<{
    content: {
      pricing?: {
        current_price: number;
        original_price?: number;
      };
      rating?: {
        rating: number;
        rating_count: number;
      };
      reviews?: {
        rating_breakdown?: {
          [key: string]: number;
        };
        recent_reviews?: Array<{
          rating: number;
          title?: string;
          content?: string;
          reviewer_name?: string;
          review_date?: string;
          verified_purchase?: boolean;
          helpful_votes?: number;
        }>;
      };
    };
  }>;
}

export const fetchProductPricing = async (asin: string): Promise<PricingResponse> => {
  const username = Deno.env.get('OXYLABS_USERNAME');
  const password = Deno.env.get('OXYLABS_PASSWORD');

  if (!username || !password) {
    throw new Error('Oxylabs credentials not found');
  }

  const payload = {
    source: 'amazon_pricing',
    query: asin,
    domain: 'com',
    geo_location: '90210',
    parse: true
  };

  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Oxylabs API error:', error);
    throw new Error(`Oxylabs API error: ${response.status}`);
  }

  return await response.json();
};

export { corsHeaders };

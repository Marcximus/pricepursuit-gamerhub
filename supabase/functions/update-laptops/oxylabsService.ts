
import { OxylabsResponse } from './types.ts';

export async function fetchProductPricing(asin: string): Promise<OxylabsResponse> {
  console.log(`[Oxylabs] Fetching pricing data for ASIN: ${asin}`);
  
  const payload = {
    source: "amazon_pricing",
    query: asin,
    domain: "com",
    geo_location: "90210",
    parse: true,
  };

  try {
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${Deno.env.get('OXYLABS_USERNAME')}:${Deno.env.get('OXYLABS_PASSWORD')}`)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`[Oxylabs] API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[Oxylabs] Error fetching pricing data:', error);
    throw error;
  }
}

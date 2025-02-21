
import { OxylabsResult } from './types.ts';

const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');

export async function fetchBrandData(brand: string, pages: number): Promise<OxylabsResult[]> {
  console.log(`Sending request to Oxylabs API for brand ${brand}...`);
  
  const payload = {
    source: 'amazon_search',
    query: `${brand} laptop`,
    domain: 'com',
    geo_location: '90210',
    start_page: '1',
    pages: pages.toString(),
    parse: true
  };

  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error(`Oxylabs API error for ${brand}:`, {
      status: response.status,
      statusText: response.statusText
    });
    throw new Error(`Oxylabs API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

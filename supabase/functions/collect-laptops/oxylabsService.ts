
import { OxylabsResponse } from './types.ts';

export async function fetchLaptopData(brand: string, page: number): Promise<OxylabsResponse> {
  console.log(`[Oxylabs] Fetching data for ${brand} - page ${page}`);
  
  const payload = {
    source: "amazon_search",
    domain: "com",
    query: `${brand} laptop`,
    start_page: page,
    pages: 1,
    parse: true,
  };

  try {
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');
    
    if (!username || !password) {
      throw new Error('[Oxylabs] Missing credentials');
    }
    
    console.log(`[Oxylabs] Making request with payload:`, JSON.stringify(payload, null, 2));
    
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Oxylabs] API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`[Oxylabs] API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.results || !Array.isArray(data.results)) {
      console.error('[Oxylabs] Invalid response structure:', data);
      throw new Error('[Oxylabs] Invalid response structure');
    }
    
    return data;
  } catch (error) {
    console.error('[Oxylabs] Error fetching data:', error);
    throw error;
  }
}

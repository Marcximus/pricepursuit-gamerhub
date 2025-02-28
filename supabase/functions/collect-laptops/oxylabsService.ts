
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
    console.error('[Oxylabs] Error fetching data:', error);
    throw error;
  }
}

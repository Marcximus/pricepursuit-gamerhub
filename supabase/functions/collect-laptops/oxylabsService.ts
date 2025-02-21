
const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');

export async function fetchBrandData(brand: string, pages: number = 5): Promise<OxylabsResult[]> {
  console.log(`Fetching data for brand ${brand} (5 pages)`);
  
  const payload = {
    source: 'amazon_search',
    query: `${brand} laptop`,
    domain: 'com',
    geo_location: '90210',
    start_page: '1',  // Fixed to start from page 1
    pages: '5',       // Fixed to 5 pages as per requirements
    parse: true
  };

  try {
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
    console.log(`Successfully fetched ${data.results?.length || 0} results for ${brand}`);
    return data.results || [];
  } catch (error) {
    console.error(`Failed to fetch data for brand ${brand}:`, error);
    throw error;
  }
}

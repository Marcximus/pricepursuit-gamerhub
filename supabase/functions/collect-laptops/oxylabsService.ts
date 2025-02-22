const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');

export async function fetchBrandData(brand: string, pagesPerBrand: number): Promise<any[]> {
  const results: any[] = [];
  const retryLimit = 3;
  const delayBetweenRetries = 2000; // 2 seconds

  const body = {
    source: "amazon_search",
    domain: "com",
    query: `${brand} laptop`,
    start_page: 6,
    pages: pagesPerBrand,
    geo_location: "United States",
    parse: true
  };

  try {
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
      },
      body: JSON.stringify(body)
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

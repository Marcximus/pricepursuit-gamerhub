
const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME');
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, baseDelay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Rate limited, waiting ${delay}ms before retry ${i + 1}/${retries}`);
        await sleep(delay);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Request failed, waiting ${delay}ms before retry ${i + 1}/${retries}`);
      await sleep(delay);
    }
  }
  throw new Error('Max retries reached');
}

export async function fetchBrandData(brand: string, pages: number = 5): Promise<any[]> {
  console.log(`Fetching data for brand ${brand} (${pages} pages)`);
  
  const payload = {
    source: 'amazon_search',
    query: `${brand} laptop`,
    domain: 'com',
    geo_location: '90210',
    start_page: '1',
    pages: pages.toString(),
    parse: true
  };

  try {
    // Add a small delay before making the request to avoid hitting rate limits
    await sleep(1000);

    const response = await fetchWithRetry(
      'https://realtime.oxylabs.io/v1/queries',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
        },
        body: JSON.stringify(payload)
      },
      3, // Max retries
      2000 // Base delay in ms
    );

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

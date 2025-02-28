
const OXYLABS_USERNAME = Deno.env.get("OXYLABS_USERNAME");
const OXYLABS_PASSWORD = Deno.env.get("OXYLABS_PASSWORD");

/**
 * Fetches laptop data from Oxylabs for a specific brand and page
 * @param brand Brand name to search for
 * @param page Page number to fetch
 * @returns Oxylabs API response
 */
export async function fetchLaptopData(brand: string, page: number) {
  console.log(`Fetching data for ${brand} on page ${page}`);
  
  const query = `${brand} laptop`;
  const payload = {
    source: "amazon_search",
    domain: "com",
    query,
    start_page: page,
    pages: 1,
    parse: true,
    context: [
      {
        key: "category_id",
        value: "13896617011" // Laptops category on Amazon
      }
    ]
  };
  
  // Set up authorization
  const auth = btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`);
  
  try {
    console.log(`Making request to Oxylabs for: ${query}, page ${page}`);
    
    const response = await fetch("https://realtime.oxylabs.io/v1/queries", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${auth}`
      }
    });
    
    if (!response.ok) {
      const statusCode = response.status;
      const statusText = response.statusText;
      console.error(`[Oxylabs] API error: ${statusCode} ${statusText}`);
      throw new Error(`[Oxylabs] API error: ${statusCode}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched data for ${brand}, page ${page}`);
    return data;
  } catch (error) {
    console.error(`[Oxylabs] Error fetching data for ${brand} on page ${page}:`, error);
    throw error;
  }
}

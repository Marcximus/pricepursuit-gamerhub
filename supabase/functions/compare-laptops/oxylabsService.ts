
/**
 * Service for fetching product data from Oxylabs
 */
export async function fetchProductData(asin: string) {
  try {
    console.log(`Fetching data for ASIN ${asin} from Amazon...`);
    
    // Get API credentials from environment
    const username = Deno.env.get("OXYLABS_USERNAME");
    const password = Deno.env.get("OXYLABS_PASSWORD");
    
    if (!username || !password) {
      throw new Error("Missing Oxylabs API credentials");
    }
    
    const credentials = btoa(`${username}:${password}`);
    
    // Prepare API request
    const url = "https://realtime.oxylabs.io/v1/queries";
    const body = {
      source: "amazon_product",
      query: asin,
      domain: "com",
      start_page: 1,
      pages: 1,
      parse: true,
      context: [
        { key: "autoselect_variant", value: false },
        { key: "safe_search", value: true }
      ]
    };
    
    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${credentials}`
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Oxylabs API error for ASIN ${asin}:`, response.status, errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.results || !data.results.length || !data.results[0].content) {
      console.error(`Invalid response structure for ASIN ${asin}:`, data);
      throw new Error("Invalid API response structure");
    }
    
    // Log successful data fetch
    console.log(`Successfully fetched data for ASIN ${asin}`, {
      title: data.results[0].content.title?.substring(0, 50) + '...',
      brand: data.results[0].content.brand || 'Unknown',
      hasImages: data.results[0].content.images?.length > 0
    });
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Request timeout fetching data for ASIN ${asin}`);
      throw new Error("Request timeout");
    }
    
    console.error(`Error fetching product data for ASIN ${asin}:`, error);
    throw error;
  }
}

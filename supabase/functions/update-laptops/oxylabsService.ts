
// Get Oxylabs credentials from environment variables
const username = Deno.env.get("OXYLABS_USERNAME");
const password = Deno.env.get("OXYLABS_PASSWORD");

// Oxylabs SERP API endpoint
const endpoint = "https://realtime.oxylabs.io/v1/queries";

// Check if credentials are available
if (!username || !password) {
  console.error("OXYLABS_USERNAME or OXYLABS_PASSWORD environment variables are not set");
}

export async function fetchLaptopData(asin: string): Promise<any> {
  try {
    console.log(`Fetching data for ASIN ${asin} from Oxylabs`);

    // Build the request payload
    // The error suggests we should use a different approach instead of 'url'
    const payload = {
      source: "amazon_product",
      domain: "com",
      query: asin,  // Using asin as query instead of url
      parse: true
    };

    // Log request details (excluding sensitive info)
    console.log(`Making request to Oxylabs for ASIN ${asin}`);

    // Make the API request to Oxylabs
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${username}:${password}`)
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Error from Oxylabs API (${response.status}): ${responseText}`);
      throw new Error(`Oxylabs API error (${response.status}): ${responseText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    
    if (!data || !data.results || !data.results[0] || !data.results[0].content) {
      console.error(`Unexpected response structure from Oxylabs for ASIN ${asin}:`, JSON.stringify(data).slice(0, 200) + '...');
      return null;
    }

    const content = data.results[0].content;
    
    // Extract and return relevant information
    const productData = {
      asin: content.asin || asin,
      title: content.title,
      current_price: content.price?.value || null,
      original_price: content.list_price?.value || null,
      rating: content.rating,
      rating_count: content.ratings_total,
      image_url: content.images && content.images.length > 0 ? content.images[0].link : null,
      product_url: `https://www.amazon.com/dp/${asin}`,
      last_checked: new Date().toISOString(),
      update_status: 'completed'
    };

    console.log(`Successfully fetched data for ASIN ${asin}`);
    return productData;
  } catch (error) {
    console.error(`Error fetching data for ASIN ${asin}:`, error);
    throw error;
  }
}

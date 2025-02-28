
import { scrapingHeaders } from './databaseService.ts';

// Get Oxylabs credentials from environment variables
const username = Deno.env.get("OXYLABS_USERNAME");
const password = Deno.env.get("OXYLABS_PASSWORD");

// Oxylabs SERP API endpoint
const endpoint = "https://realtime.oxylabs.io/v1/queries";

// Check if credentials are available
if (!username || !password) {
  console.error("OXYLABS_USERNAME or OXYLABS_PASSWORD environment variables are not set");
}

export async function scrapeBrandData(brand: string, page: number = 1): Promise<any[]> {
  try {
    const brandQuery = encodeURIComponent(`${brand} laptop`);
    console.log(`Scraping data for ${brand} laptops, page ${page}`);

    // Build the request payload
    const payload = {
      source: "amazon_search",
      domain: "com",
      query: `${brandQuery}`,
      start_page: page,
      pages: 1,
      parse: true,
      context: [
        { key: "category_id", value: "565108" } // Electronics > Computers & Accessories > Laptops
      ]
    };

    // Log request details (excluding sensitive info)
    console.log(`Making request to Oxylabs for ${brand} page ${page}`);

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
      throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response
    const data = await response.json();
    
    // Validate the response structure
    if (!data || !data.results || !data.results[0] || !data.results[0].content) {
      console.error(`Unexpected response structure from Oxylabs for ${brand} page ${page}:`, JSON.stringify(data).slice(0, 200) + '...');
      return [];
    }

    // Extract the product results
    let results = data.results[0].content;
    
    if (!results || !results.results) {
      console.error(`No results in Oxylabs response for ${brand} page ${page}`);
      return [];
    }

    // Extract the organic results only
    let laptops = results.results.organic || [];
    
    // Add validation to ensure we have an array of laptops
    if (!Array.isArray(laptops)) {
      console.error(`Expected an array of laptops but got ${typeof laptops}:`, laptops);
      return [];
    }
    
    // Log the number of laptops found
    console.log(`Found ${laptops.length} laptops for ${brand} on page ${page}`);
    
    // Return the array of laptops
    return laptops;
  } catch (error) {
    console.error(`Error scraping data for ${brand} page ${page}:`, error);
    return []; // Return empty array on error instead of throwing to make the code more resilient
  }
}


/**
 * Service to fetch laptop data from Amazon using Oxylabs proxy
 */

// Define the structure of the data we expect back
interface LaptopData {
  title?: string;
  current_price?: number | null;
  original_price?: number | null;
  rating?: number | null;
  rating_count?: number | null;
  total_reviews?: number | null;
  image_url?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  graphics?: string;
  screen_size?: string;
  screen_resolution?: string;
  weight?: string;
  battery_life?: string;
  brand?: string;
  model?: string;
}

/**
 * Fetch laptop data from Amazon using Oxylabs
 */
export async function fetchLaptopData(asin: string): Promise<LaptopData | null> {
  try {
    console.log(`Fetching data for ASIN ${asin} from Amazon...`);
    
    // Oxylabs credentials
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');
    
    if (!username || !password) {
      throw new Error('Oxylabs credentials not found in environment');
    }
    
    // Endpoint for Oxylabs e-commerce scraper API
    const url = 'https://realtime.oxylabs.io/v1/queries';
    
    // Create the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      },
      body: JSON.stringify({
        source: 'amazon_product',
        domain: 'com',
        query: asin,
        parse: true,
        context: [
          { key: 'device_type', value: 'desktop' }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Oxylabs API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Successfully fetched data for ASIN ${asin}`, data);
    
    if (!data.results || data.results.length === 0) {
      console.error(`No results for ASIN ${asin}`);
      return null;
    }
    
    const result = data.results[0];
    console.log(`Successfully fetched data for ASIN ${asin}`);
    
    // Extract and normalize laptop data
    const laptopData: LaptopData = {
      title: result.content?.title,
      current_price: result.content?.price?.current_price ? parseFloat(result.content.price.current_price) : null,
      original_price: result.content?.price?.original_price ? parseFloat(result.content.price.original_price) : null,
      rating: result.content?.rating ? parseFloat(result.content.rating) : null,
      rating_count: result.content?.rating_count ? parseInt(result.content.rating_count.replace(/[^\d]/g, ''), 10) : null,
      total_reviews: result.content?.total_reviews || null,
      image_url: result.content?.image_url,
      brand: extractBrand(result),
      model: extractModel(result)
    };
    
    // Extract specifications
    if (result.content?.specifications) {
      extractSpecifications(result.content.specifications, laptopData);
    }
    
    // Extract from product description if available
    if (result.content?.description) {
      extractFromDescription(result.content.description, laptopData);
    }
    
    return laptopData;
  } catch (error) {
    console.error(`Error fetching data for ASIN ${asin}:`, error);
    return null;
  }
}

/**
 * Extract brand from product data
 */
function extractBrand(result: any): string | undefined {
  // Try to get brand from different possible locations
  return result.content?.brand || 
         result.content?.specifications?.find((s: any) => 
           s.name?.toLowerCase().includes('brand'))?.value;
}

/**
 * Extract model information
 */
function extractModel(result: any): string | undefined {
  // Look for model in specifications
  const modelSpec = result.content?.specifications?.find((s: any) => 
    s.name?.toLowerCase().includes('model') || 
    s.name?.toLowerCase().includes('series'));
    
  return modelSpec?.value;
}

/**
 * Extract specifications from product data
 */
function extractSpecifications(specifications: any[], laptopData: LaptopData): void {
  for (const spec of specifications) {
    const name = spec.name?.toLowerCase();
    const value = spec.value;
    
    if (!name || !value) continue;
    
    if (name.includes('processor') || name.includes('cpu')) {
      laptopData.processor = value;
    }
    else if (name.includes('ram') || name.includes('memory')) {
      laptopData.ram = value;
    }
    else if (name.includes('storage') || name.includes('hard drive') || name.includes('ssd')) {
      laptopData.storage = value;
    }
    else if (name.includes('graphics') || name.includes('gpu')) {
      laptopData.graphics = value;
    }
    else if (name.includes('screen size') || name.includes('display size')) {
      laptopData.screen_size = value;
    }
    else if (name.includes('resolution') || name.includes('display resolution')) {
      laptopData.screen_resolution = value;
    }
    else if (name.includes('weight')) {
      laptopData.weight = value;
    }
    else if (name.includes('battery') || name.includes('battery life')) {
      laptopData.battery_life = value;
    }
  }
}

/**
 * Extract specifications from product description
 */
function extractFromDescription(description: string, laptopData: LaptopData): void {
  // Only extract data that wasn't found in specifications
  
  // Processor
  if (!laptopData.processor) {
    const processorMatch = description.match(/(?:processor|cpu):\s*([^,\n]+)/i);
    if (processorMatch) laptopData.processor = processorMatch[1].trim();
  }
  
  // RAM
  if (!laptopData.ram) {
    const ramMatch = description.match(/(?:RAM|memory):\s*(\d+\s*GB)/i);
    if (ramMatch) laptopData.ram = ramMatch[1].trim();
  }
  
  // Storage
  if (!laptopData.storage) {
    const storageMatch = description.match(/(?:storage|ssd|hard drive):\s*([^,\n]+)/i);
    if (storageMatch) laptopData.storage = storageMatch[1].trim();
  }
  
  // Graphics
  if (!laptopData.graphics) {
    const graphicsMatch = description.match(/(?:graphics|gpu):\s*([^,\n]+)/i);
    if (graphicsMatch) laptopData.graphics = graphicsMatch[1].trim();
  }
  
  // Screen size
  if (!laptopData.screen_size) {
    const screenMatch = description.match(/(\d+(?:\.\d+)?[\s-]*(?:inch|"|in))/i);
    if (screenMatch) laptopData.screen_size = screenMatch[1].trim();
  }
}

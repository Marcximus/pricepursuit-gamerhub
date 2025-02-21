
interface OxyLabsResponse {
  results: Array<{
    content: {
      title?: string;
      description?: string;
      price?: {
        current: number;
        previous?: number;
      };
      rating?: number;
      rating_breakdown?: {
        total_count: number;
      };
      images?: string[];
      reviews?: any;
      product_details?: {
        processor?: string;
        ram?: string;
        hard_drive?: string;
        graphics_coprocessor?: string;
        standing_screen_display_size?: string;
        screen_resolution?: string;
        item_weight?: string;
        batteries?: string;
      };
    };
  }>;
}

export async function fetchProductData(asin: string, username: string, password: string): Promise<any> {
  console.log(`Fetching data for ASIN: ${asin}`);
  
  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    },
    body: JSON.stringify({
      source: 'amazon_product',
      query: asin,
      domain: 'com',
      geo_location: '90210',
      parse: true
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: OxyLabsResponse = await response.json();
  console.log(`Got Oxylabs response for ${asin}`);
  return data.results?.[0]?.content;
}


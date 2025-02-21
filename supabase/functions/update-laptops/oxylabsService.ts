
import { OxylabsResponse } from './types.ts';

export async function fetchLaptopData(asin: string, username: string, password: string): Promise<OxylabsResponse> {
  console.log(`Fetching data for ASIN: ${asin}`);
  
  const payload = {
    source: 'amazon_product',
    query: asin,
    domain: 'com',
    geo_location: '90210',
    parse: true
  };

  try {
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Oxylabs response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching laptop data:', error);
    throw error;
  }
}

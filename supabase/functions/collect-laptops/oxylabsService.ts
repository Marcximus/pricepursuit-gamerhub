
import { OxylabsResponse } from './types.ts';

export async function fetchLaptopData(query: string, page: number = 1, username: string, password: string): Promise<OxylabsResponse> {
  console.log(`Fetching data for query: ${query}, page: ${page}`);
  
  const payload = {
    source: 'amazon_search',
    query: query,
    domain: 'com',
    geo_location: '90210',
    start_page: page.toString(),
    pages: '1', // We'll make one request per page for better control
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


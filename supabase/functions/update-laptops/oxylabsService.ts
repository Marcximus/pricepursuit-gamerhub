
import { OxylabsResponse } from './types.ts';

export async function fetchLaptopData(asin: string, username: string, password: string): Promise<OxylabsResponse> {
  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`),
    },
    body: JSON.stringify({
      source: 'amazon_product',
      query: asin,
      parse: true,
      parsing_instructions: {
        title: {
          _fns: [
            {
              _fn: "xpath_one",
              _args: ["//span[@id=\"productTitle\"]/text()"]
            }
          ]
        },
        price: {
          _fns: [
            {
              _fn: "xpath_one",
              _args: ["//span[@class=\"a-price-whole\"]/text()"]
            }
          ]
        },
        ratings: {
          _fns: [
            {
              _fn: "xpath_one",
              _args: ["//span[@class=\"a-icon-alt\"]/text()"]
            }
          ]
        },
        reviews: {
          _fns: [
            {
              _fn: "xpath_one",
              _args: ["//span[@id=\"acrCustomerReviewText\"]/text()"]
            }
          ]
        }
      }
    })
  });

  const data: OxylabsResponse = await response.json();
  if (!data.results?.[0]?.content) {
    throw new Error('No content in Oxylabs response');
  }

  return data;
}


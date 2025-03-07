
/**
 * Service for fetching product data
 */
import { corsHeaders } from "../../_shared/cors.ts";
import { logError } from "../utils/errorHandler.ts";

/**
 * Fetch product data for a given ASIN
 */
export async function fetchProductData(productAsin: string, requestUrl: string, authHeader: string | null): Promise<any> {
  console.log(`🔎 Fetching product data for ASIN: ${productAsin}`);
  try {
    const fetchUrl = `${requestUrl.split('/generate-blog-post')[0]}/fetch-product-data`;
    console.log(`📡 Making request to: ${fetchUrl}`);
    
    const productResponse = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({ asin: productAsin }),
    });

    if (!productResponse.ok) {
      console.error(`❌ Error fetching product data: ${productResponse.status}`);
      const errorText = await productResponse.text();
      console.error(`📄 Response: ${errorText}`);
      return null;
    }
    
    const data = await productResponse.json();
    console.log(`✅ Successfully fetched product data: "${data.title.substring(0, 30)}..."`);
    console.log(`💰 Price: ${data.price?.current || 'N/A'}`);
    console.log(`⭐ Rating: ${data.rating?.rating || 'N/A'} (${data.rating?.rating_count || 0} reviews)`);
    return data;
  } catch (error) {
    logError(error, 'Error fetching product data');
    return null;
  }
}

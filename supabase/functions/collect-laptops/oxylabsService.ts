
// The Deno.env.get won't work in the browser preview, but will work in the Supabase Edge Function environment
const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME') ?? ''
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD') ?? ''

export function createOxylabsClient() {
  if (!OXYLABS_USERNAME || !OXYLABS_PASSWORD) {
    console.error('Oxylabs credentials not found in environment variables')
    throw new Error('Missing Oxylabs credentials')
  }

  return {
    fetchLaptopsByBrand: async (brand: string, page: number) => {
      try {
        console.log(`[Oxylabs] Starting request for brand: ${brand}, page: ${page}`)
        
        const url = `https://www.amazon.com/s?k=${encodeURIComponent(brand)}+laptop&page=${page}`
        console.log(`[Oxylabs] Request URL: ${url}`)
        
        const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`),
          },
          body: JSON.stringify({
            source: 'amazon_search',
            domain: 'com',
            query: `${brand} laptop`,
            start_page: page,
            pages: 1,
            parse: true,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[Oxylabs] API response error: ${response.status} ${response.statusText}`)
          console.error(`[Oxylabs] Error details: ${errorText}`)
          throw new Error(`Oxylabs API error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        console.log(`[Oxylabs] Response received for ${brand}, page ${page}`)
        console.log(`[Oxylabs] Response status: ${response.status}`)
        console.log(`[Oxylabs] Results count: ${data.results?.length || 0}`)
        
        if (data.results && data.results[0] && data.results[0].content && data.results[0].content.organic) {
          console.log(`[Oxylabs] Found ${data.results[0].content.organic.length} organic products`)
          
          // Log a sample of the first product to help with debugging
          if (data.results[0].content.organic.length > 0) {
            const sampleProduct = data.results[0].content.organic[0]
            console.log(`[Oxylabs] Sample product: ASIN=${sampleProduct.asin}, Title=${sampleProduct.title}`)
          }
        } else {
          console.warn(`[Oxylabs] No organic products found in the response`)
        }
        
        return data
      } catch (error) {
        console.error(`[Oxylabs] Error fetching data for ${brand}, page ${page}:`, error)
        throw error
      }
    }
  }
}


import { LaptopData } from './types.ts'

// Constants
const OXYLABS_USERNAME = Deno.env.get('OXYLABS_USERNAME') || ''
const OXYLABS_PASSWORD = Deno.env.get('OXYLABS_PASSWORD') || ''

export async function fetchLaptopData(asin: string): Promise<LaptopData | null> {
  try {
    console.log(`Fetching data for ASIN: ${asin}`)
    
    const url = `https://www.amazon.com/dp/${asin}`
    
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${OXYLABS_USERNAME}:${OXYLABS_PASSWORD}`)
      },
      body: JSON.stringify({
        source: 'amazon_product',
        url: url,
        geo_location: 'United States',
        parse: true,
        render: 'html'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Oxylabs API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      console.error(`No results found for ASIN ${asin}`)
      return null
    }

    const result = data.results[0]
    const content = result.content
    
    if (!content || !content.product) {
      console.error(`No product data found for ASIN ${asin}`)
      return null
    }

    // Extract and format all available data
    const product = content.product
    
    console.log(`Successfully fetched data for ASIN ${asin}: ${product.title}`)
    
    // Process specifications from all available sources
    const specs = processSpecifications(product)
    
    // Process reviews
    const reviews = processReviews(product)
    
    // Extract price information
    const priceData = extractPriceData(product)
    
    // Create a comprehensive structured response
    const laptopData: LaptopData = {
      asin: asin,
      title: product.title || null,
      current_price: priceData.current_price,
      original_price: priceData.original_price,
      rating: product.rating?.value ? parseFloat(product.rating.value) : null,
      rating_count: product.ratings_total ? parseInt(product.ratings_total.replace(/,/g, '')) : null,
      total_reviews: product.reviews_total ? parseInt(product.reviews_total.replace(/,/g, '')) : null,
      image_url: product.images?.primary?.large || product.images?.primary?.medium || null,
      product_url: url,
      description: product.description || product.feature_bullets_flatted || null,
      
      // Specifications
      processor: specs.processor || null,
      ram: specs.ram || null,
      storage: specs.storage || null,
      graphics: specs.graphics || null,
      screen_size: specs.screen_size || null,
      screen_resolution: specs.screen_resolution || null,
      weight: specs.weight || null,
      battery_life: specs.battery_life || null,
      brand: product.brand || null,
      model: specs.model || null,
      
      // Review data
      review_data: {
        rating_breakdown: product.rating_breakdown || {},
        recent_reviews: reviews
      },
      
      // Additional information that could be useful
      category: product.categories?.length > 0 ? product.categories[0]?.name : null,
      features: product.feature_bullets || null,
      availability: product.availability?.type || null
    }

    return laptopData
  } catch (error) {
    console.error(`Error fetching data for ASIN ${asin}:`, error)
    return null
  }
}

// Helper function to process specifications from multiple sources
function processSpecifications(product: any): Record<string, string> {
  const specs: Record<string, string> = {}
  
  // Try to extract from specifications table
  if (product.specifications && Array.isArray(product.specifications)) {
    for (const specGroup of product.specifications) {
      if (specGroup.specifications && Array.isArray(specGroup.specifications)) {
        for (const spec of specGroup.specifications) {
          const key = spec.name?.toLowerCase()
          const value = spec.value
          
          if (key && value) {
            // Process processor information
            if (key.includes('processor') || key.includes('cpu')) {
              specs.processor = value
            }
            
            // Process RAM information
            else if (key.includes('ram') || key.includes('memory')) {
              specs.ram = value
            }
            
            // Process storage information
            else if (key.includes('hard drive') || key.includes('ssd') || key.includes('storage')) {
              specs.storage = value
            }
            
            // Process graphics information
            else if (key.includes('graphics') || key.includes('gpu') || key.includes('video')) {
              specs.graphics = value
            }
            
            // Process screen size information
            else if (key.includes('screen size') || key.includes('display size')) {
              specs.screen_size = value
            }
            
            // Process screen resolution
            else if (key.includes('resolution') || key.includes('display resolution')) {
              specs.screen_resolution = value
            }
            
            // Process weight information
            else if (key.includes('weight') || key.includes('item weight')) {
              specs.weight = value
            }
            
            // Process battery information
            else if (key.includes('battery') || key.includes('battery life')) {
              specs.battery_life = value
            }
            
            // Process model information
            else if (key.includes('model') || key.includes('model name') || key.includes('model number')) {
              specs.model = value
            }
          }
        }
      }
    }
  }
  
  // Try to extract specs from feature bullets if specifications are missing
  if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
    for (const feature of product.feature_bullets) {
      const featureText = feature.toLowerCase()
      
      // Extract processor info
      if (!specs.processor && (featureText.includes('processor') || featureText.includes('intel') || featureText.includes('amd') || featureText.includes('ryzen') || featureText.includes('core i'))) {
        const processorMatch = featureText.match(/(?:intel|amd)[\w\s-]+(i[3579]|ryzen|celeron|pentium)[\w\s-]+(?:\d{4,5}[a-z]*)/i)
        if (processorMatch) {
          specs.processor = processorMatch[0]
        }
      }
      
      // Extract RAM info
      if (!specs.ram && featureText.includes('ram') || featureText.includes('memory') || featureText.match(/\b\d+\s*gb\b/i)) {
        const ramMatch = featureText.match(/\b(\d+)\s*gb\s*(?:ddr\d*)?(?:\s*ram|\s*memory)?/i)
        if (ramMatch) {
          specs.ram = `${ramMatch[1]}GB`
        }
      }
      
      // Extract storage info
      if (!specs.storage && (featureText.includes('storage') || featureText.includes('ssd') || featureText.includes('hdd') || featureText.includes('emmc'))) {
        const storageMatch = featureText.match(/\b(\d+)\s*(gb|tb)\s*(?:ssd|hdd|storage|emmc)/i)
        if (storageMatch) {
          specs.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()}`
        }
      }
      
      // Extract screen size
      if (!specs.screen_size && (featureText.includes('screen') || featureText.includes('display') || featureText.includes('inch'))) {
        const screenMatch = featureText.match(/\b(\d+\.?\d*)\s*(?:"|inch|inches)/i)
        if (screenMatch) {
          specs.screen_size = `${screenMatch[1]}"`
        }
      }
    }
  }
  
  // Try to extract from the title as last resort
  if (product.title) {
    const title = product.title.toLowerCase()
    
    // Extract processor if not already found
    if (!specs.processor) {
      const processorPatterns = [
        /(?:intel|amd)[\w\s-]+(i[3579]|ryzen|celeron|pentium)[\w\s-]+(?:\d{4,5}[a-z]*)/i,
        /\b(i[3579]-\d{4,5}[a-z]*)\b/i,
        /\b(ryzen\s*\d\s*\d{4}[a-z]*)\b/i,
        /\b(apple\s*m[123](?:\s*pro|\s*max|\s*ultra)?)\b/i
      ]
      
      for (const pattern of processorPatterns) {
        const match = title.match(pattern)
        if (match) {
          specs.processor = match[0]
          break
        }
      }
    }
    
    // Extract RAM if not already found
    if (!specs.ram) {
      const ramMatch = title.match(/\b(\d+)\s*gb\s*(?:ddr\d*)?(?:\s*ram|\s*memory)?\b/i)
      if (ramMatch) {
        specs.ram = `${ramMatch[1]}GB`
      }
    }
    
    // Extract storage if not already found
    if (!specs.storage) {
      const storageMatch = title.match(/\b(\d+)\s*(gb|tb)\s*(?:ssd|hdd|storage|emmc)?\b/i)
      if (storageMatch && !title.substring(storageMatch.index - 15, storageMatch.index).includes('ram')) {
        specs.storage = `${storageMatch[1]}${storageMatch[2].toUpperCase()}`
      }
    }
    
    // Extract screen size if not already found
    if (!specs.screen_size) {
      const screenMatch = title.match(/\b(\d+\.?\d*)\s*(?:"|inch|inches)\b/i)
      if (screenMatch) {
        specs.screen_size = `${screenMatch[1]}"`
      }
    }
  }
  
  return specs
}

// Helper function to process reviews
function processReviews(product: any): any[] {
  const reviews: any[] = []
  
  if (product.reviews && Array.isArray(product.reviews)) {
    for (const review of product.reviews) {
      reviews.push({
        rating: review.rating ? parseFloat(review.rating) : null,
        title: review.title || null,
        content: review.body || null,
        reviewer_name: review.reviewer?.name || 'Anonymous',
        review_date: review.date || null,
        verified_purchase: review.verified_purchase || false,
        helpful_votes: review.helpful_votes ? parseInt(review.helpful_votes) : 0
      })
    }
  }
  
  return reviews
}

// Helper function to extract price data
function extractPriceData(product: any): { current_price: number | null; original_price: number | null } {
  let current_price = null
  let original_price = null
  
  // Extract current price
  if (product.buybox_winner && product.buybox_winner.price) {
    const priceValue = product.buybox_winner.price.value
    if (typeof priceValue === 'string') {
      // Remove currency symbol and commas, then parse
      current_price = parseFloat(priceValue.replace(/[^0-9.]/g, ''))
    } else if (typeof priceValue === 'number') {
      current_price = priceValue
    }
  } else if (product.price && product.price.value) {
    const priceValue = product.price.value
    if (typeof priceValue === 'string') {
      current_price = parseFloat(priceValue.replace(/[^0-9.]/g, ''))
    } else if (typeof priceValue === 'number') {
      current_price = priceValue
    }
  }
  
  // Extract original/list price
  if (product.buybox_winner && product.buybox_winner.price && product.buybox_winner.price.list_price) {
    const listPrice = product.buybox_winner.price.list_price
    if (typeof listPrice === 'string') {
      original_price = parseFloat(listPrice.replace(/[^0-9.]/g, ''))
    } else if (typeof listPrice === 'number') {
      original_price = listPrice
    }
  } else if (product.price && product.price.list_price) {
    const listPrice = product.price.list_price
    if (typeof listPrice === 'string') {
      original_price = parseFloat(listPrice.replace(/[^0-9.]/g, ''))
    } else if (typeof listPrice === 'number') {
      original_price = listPrice
    }
  }
  
  // Avoid null values for comparison
  current_price = current_price || 0
  original_price = original_price || 0
  
  // Make sure original price is not less than current price
  if (original_price > 0 && current_price > 0 && original_price < current_price) {
    original_price = current_price
  }
  
  // Convert zeros back to null
  current_price = current_price > 0 ? current_price : null
  original_price = original_price > 0 ? original_price : null
  
  return { current_price, original_price }
}

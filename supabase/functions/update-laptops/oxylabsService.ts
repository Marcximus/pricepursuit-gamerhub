
import { LaptopUpdate } from './types.ts';

/**
 * Fetch laptop data from Amazon using Oxylabs
 */
export const fetchLaptopData = async (asin: string): Promise<Partial<LaptopUpdate> | null> => {
  try {
    console.log(`Fetching data for ASIN: ${asin}`);
    
    // Get Oxylabs credentials from environment
    const username = Deno.env.get('OXYLABS_USERNAME');
    const password = Deno.env.get('OXYLABS_PASSWORD');
    
    if (!username || !password) {
      throw new Error('Oxylabs credentials not configured');
    }
    
    // Prepare authorization header
    const auth = btoa(`${username}:${password}`);
    
    // Request data from Oxylabs
    const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        source: 'amazon',
        domain: 'com',
        parse: true,
        render: 'html',
        content_encoding: 'gzip',
        geo_location: 'United States',
        user_agent_type: 'desktop',
        url: `https://www.amazon.com/dp/${asin}`
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Oxylabs API error (${response.status}): ${errorText}`);
    }
    
    // Parse the response
    const data = await response.json();
    
    if (!data.results || data.results.length === 0 || !data.results[0].content) {
      throw new Error('No results returned from Oxylabs');
    }
    
    const content = data.results[0].content;
    
    // Extract relevant product information
    const extractedData: Partial<LaptopUpdate> = {
      title: content.title || null,
      current_price: content.price?.value || null,
      original_price: content.original_price?.value || null,
      rating: content.rating || null,
      rating_count: content.ratings_total || null,
      total_reviews: content.reviews_total || null,
      image_url: content.images && content.images.length > 0 ? content.images[0] : null
    };
    
    // Extract specifications
    if (content.specifications) {
      // Extract processor information
      const processor = extractSpecFromTitle(content.title) || 
                      extractSpecFromFeatures(content.feature_bullets) ||
                      extractFromSpecifications(content.specifications, 'processor');
      
      // Extract RAM
      const ram = extractRamFromTitle(content.title) ||
                extractFromSpecifications(content.specifications, 'ram');
      
      // Extract storage
      const storage = extractStorageFromTitle(content.title) ||
                    extractFromSpecifications(content.specifications, 'storage');
      
      // Extract graphics card information
      const graphics = extractGraphicsFromTitle(content.title) ||
                     extractFromSpecifications(content.specifications, 'graphics');
      
      // Extract screen size
      const screenSize = extractScreenSizeFromTitle(content.title) ||
                       extractFromSpecifications(content.specifications, 'screen_size');
      
      // Extract screen resolution
      const screenResolution = extractFromSpecifications(content.specifications, 'resolution');
      
      // Assign extracted specifications
      Object.assign(extractedData, {
        processor,
        ram,
        storage,
        graphics,
        screen_size: screenSize,
        screen_resolution: screenResolution
      });
      
      // Extract brand if available
      const brand = extractBrandFromTitle(content.title) ||
                  extractFromSpecifications(content.specifications, 'brand');
      
      if (brand) {
        extractedData.brand = brand;
      }
    }
    
    console.log(`Successfully extracted data for ASIN ${asin}:`, extractedData);
    return extractedData;
    
  } catch (error) {
    console.error(`Error fetching data for ASIN ${asin}:`, error);
    return null;
  }
};

/**
 * Helper functions to extract specifications from various parts of the product data
 */

function extractSpecFromTitle(title: string | null): string | null {
  if (!title) return null;
  
  // Processor patterns - match Intel Core i3/i5/i7/i9 or AMD Ryzen 3/5/7/9
  const processorPatterns = [
    /Intel\s+Core\s+i[3579]-\d{4,5}[A-Z]*/i,
    /Intel\s+Core\s+i[3579]\s+\d{4,5}[A-Z]*/i,
    /AMD\s+Ryzen\s+[3579]\s+\d{4,5}[A-Z]*/i,
    /AMD\s+Ryzen\s+[3579]-\d{4,5}[A-Z]*/i
  ];
  
  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

function extractRamFromTitle(title: string | null): string | null {
  if (!title) return null;
  
  // RAM patterns - match common RAM sizes (8GB, 16GB, etc.)
  const ramPatterns = [
    /\b(4|8|12|16|24|32|64)\s*GB\s+RAM\b/i,
    /\bRAM\s+(4|8|12|16|24|32|64)\s*GB\b/i,
    /\b(4|8|12|16|24|32|64)GB\b/i
  ];
  
  for (const pattern of ramPatterns) {
    const match = title.match(pattern);
    if (match) {
      if (match[0].includes('RAM')) {
        return match[0];
      } else {
        // Ensure "RAM" is in the returned value if it matched just the GB pattern
        return match[1] + 'GB RAM';
      }
    }
  }
  
  return null;
}

function extractStorageFromTitle(title: string | null): string | null {
  if (!title) return null;
  
  // Storage patterns - match SSD and HDD sizes
  const storagePatterns = [
    /\b(128|256|512|1TB|2TB)(?:\s+|\s*-\s*)(?:SSD|HDD)\b/i,
    /\b(128|256|512|1|2)(?:\s*|\s*-\s*)(?:TB|GB)(?:\s+|\s*-\s*)(?:SSD|HDD)\b/i,
    /\b(?:SSD|HDD)(?:\s+|\s*-\s*)(128|256|512|1TB|2TB)\b/i
  ];
  
  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

function extractGraphicsFromTitle(title: string | null): string | null {
  if (!title) return null;
  
  // Graphics patterns - match common GPU models
  const graphicsPatterns = [
    /NVIDIA\s+GeForce\s+(?:GTX|RTX)\s+\d{3,4}(?:\s+Ti)?\b/i,
    /GeForce\s+(?:GTX|RTX)\s+\d{3,4}(?:\s+Ti)?\b/i,
    /AMD\s+Radeon\s+(?:RX|R)\s+\d{3,4}[A-Z]*\b/i,
    /Radeon\s+(?:RX|R)\s+\d{3,4}[A-Z]*\b/i,
    /Intel\s+(?:UHD|Iris)\s+(?:Graphics|Xe)\s*\d*\b/i
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

function extractScreenSizeFromTitle(title: string | null): string | null {
  if (!title) return null;
  
  // Screen size patterns - match common laptop screen sizes
  const screenPatterns = [
    /\b(11\.6|12\.5|13\.3|14|15\.6|16|17\.3)(?:\s*|\s*-\s*)(?:inch|"|inches)\b/i,
    /\b(11\.6|12\.5|13\.3|14|15\.6|16|17\.3)(?:\s*|\s*-\s*)(?:in)\b/i
  ];
  
  for (const pattern of screenPatterns) {
    const match = title.match(pattern);
    if (match) {
      // Standardize format to "xx.x inch"
      return match[1] + ' inch';
    }
  }
  
  return null;
}

function extractBrandFromTitle(title: string | null): string | null {
  if (!title) return null;
  
  // Common laptop brand patterns
  const brandPatterns = [
    /^(HP|Dell|Lenovo|Asus|Acer|MSI|Apple|Microsoft|Samsung|LG|Razer|Toshiba|Alienware|Gigabyte)\s/i
  ];
  
  for (const pattern of brandPatterns) {
    const match = title.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractSpecFromFeatures(features: string[] | null): string | null {
  if (!features || !Array.isArray(features)) return null;
  
  // Join features and look for processor information
  const featuresText = features.join(' ');
  
  // Processor patterns for feature bullets
  const processorPatterns = [
    /Intel\s+Core\s+i[3579]-\d{4,5}[A-Z]*/i,
    /AMD\s+Ryzen\s+[3579]\s+\d{4,5}[A-Z]*/i
  ];
  
  for (const pattern of processorPatterns) {
    const match = featuresText.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

function extractFromSpecifications(specs: any, specType: string): string | null {
  if (!specs) return null;
  
  // Look through the specification table
  // The specs structure from Oxylabs can vary, so we need to handle different formats
  
  // First try the flattened specs approach
  if (Array.isArray(specs)) {
    for (const spec of specs) {
      if (!spec.name || !spec.value) continue;
      
      const name = spec.name.toLowerCase();
      
      // Match based on the spec type we're looking for
      if (
        (specType === 'processor' && (name.includes('processor') || name.includes('cpu'))) ||
        (specType === 'ram' && (name.includes('ram') || name.includes('memory'))) ||
        (specType === 'storage' && (name.includes('storage') || name.includes('hard drive') || name.includes('ssd'))) ||
        (specType === 'graphics' && (name.includes('graphics') || name.includes('gpu'))) ||
        (specType === 'screen_size' && (name.includes('screen size') || name.includes('display size'))) ||
        (specType === 'resolution' && (name.includes('resolution') || name.includes('display resolution'))) ||
        (specType === 'brand' && name.includes('brand'))
      ) {
        return spec.value;
      }
    }
  }
  
  // Try the nested specs approach where items are nested in sections
  if (specs.sections && Array.isArray(specs.sections)) {
    for (const section of specs.sections) {
      if (!section.items || !Array.isArray(section.items)) continue;
      
      for (const item of section.items) {
        if (!item.name || !item.value) continue;
        
        const name = item.name.toLowerCase();
        
        // Match based on the spec type we're looking for
        if (
          (specType === 'processor' && (name.includes('processor') || name.includes('cpu'))) ||
          (specType === 'ram' && (name.includes('ram') || name.includes('memory'))) ||
          (specType === 'storage' && (name.includes('storage') || name.includes('hard drive') || name.includes('ssd'))) ||
          (specType === 'graphics' && (name.includes('graphics') || name.includes('gpu'))) ||
          (specType === 'screen_size' && (name.includes('screen size') || name.includes('display size'))) ||
          (specType === 'resolution' && (name.includes('resolution') || name.includes('display resolution'))) ||
          (specType === 'brand' && name.includes('brand'))
        ) {
          return item.value;
        }
      }
    }
  }
  
  return null;
}

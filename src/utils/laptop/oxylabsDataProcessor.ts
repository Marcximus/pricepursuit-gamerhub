
import { normalizeBrand } from "./normalizers/brandNormalizer";
import { normalizeModel } from "./normalizers/modelNormalizer";
import { processLaptopDescription } from "../laptopUtils/descriptionProcessor";

/**
 * Advanced processor for the Oxylabs API response to extract comprehensive laptop details
 * @param apiResponse - The raw API response from Oxylabs
 * @returns Processed laptop data object
 */
export const processOxylabsResponse = (apiResponse: any): any => {
  if (!apiResponse || !apiResponse.results || !apiResponse.results.length) {
    console.error('Invalid or empty API response from Oxylabs');
    return null;
  }

  try {
    // Get the first result (primary product data)
    const content = apiResponse.results[0].content;
    console.log(`Processing Oxylabs data for ASIN: ${content.asin} | Title: ${content.title?.substring(0, 50)}...`);

    // Create a base laptop object with all data we can extract
    const laptop = {
      asin: content.asin,
      title: content.title || '',
      brand: extractBrand(content),
      model: extractModel(content),
      current_price: extractPrice(content),
      original_price: extractOriginalPrice(content),
      image_url: extractImageUrl(content),
      product_url: content.url || `https://www.amazon.com/dp/${content.asin}`,
      rating: extractRating(content),
      rating_count: extractReviewCount(content),
      description: extractDescription(content),
      processor: extractProcessor(content),
      ram: extractRam(content),
      storage: extractStorage(content),
      screen_size: extractScreenSize(content),
      screen_resolution: extractScreenResolution(content),
      graphics: extractGraphics(content),
      weight: extractWeight(content),
      operating_system: extractOS(content),
      touchscreen: extractTouchscreen(content),
      color: extractColor(content),
      review_data: extractReviewData(content),
      last_checked: new Date().toISOString()
    };

    // Enhanced processing with description analysis
    if (laptop.description) {
      const enhancedSpecs = processLaptopDescription(
        laptop.description, 
        laptop.title,
        {
          processor: laptop.processor,
          ram: laptop.ram,
          storage: laptop.storage,
          screen_size: laptop.screen_size,
          screen_resolution: laptop.screen_resolution,
          graphics: laptop.graphics,
          weight: laptop.weight,
          operating_system: laptop.operating_system,
          touchscreen: laptop.touchscreen,
          color: laptop.color
        }
      );
      
      // Merge the enhanced specs back into the laptop object
      Object.assign(laptop, enhancedSpecs);
    }

    // Log processing results for debugging
    console.log('Processed Oxylabs data:', {
      asin: laptop.asin,
      title: laptop.title?.substring(0, 50) + '...',
      brand: laptop.brand,
      model: laptop.model,
      price: laptop.current_price,
      hasImage: !!laptop.image_url,
      processor: laptop.processor,
      ram: laptop.ram,
      storage: laptop.storage,
      screen: laptop.screen_size,
      graphics: laptop.graphics
    });

    return laptop;
  } catch (error) {
    console.error('Error processing Oxylabs data:', error);
    return null;
  }
};

// Extract brand with priority logic (from multiple sources)
function extractBrand(content: any): string {
  // Try multiple sources in order of reliability
  const sources = [
    content.brand,
    content.product_details?.brand?.replace('‎', ''),
    // Extract from title
    content.title ? normalizeBrand('', content.title) : null
  ];
  
  // Return the first non-empty value
  for (const source of sources) {
    if (source && typeof source === 'string' && source.trim().length > 0) {
      return source.trim();
    }
  }
  
  return '';
}

// Extract model with best-effort approach
function extractModel(content: any): string {
  const brand = extractBrand(content);
  const title = content.title || '';
  
  // Try product_details.series first
  if (content.product_details?.series && 
      typeof content.product_details.series === 'string' &&
      content.product_details.series.trim().length > 0) {
    return content.product_details.series.replace('‎', '').trim();
  }
  
  // Fall back to model extractor
  return normalizeModel('', title, brand);
}

// Extract current price with fallbacks
function extractPrice(content: any): number | null {
  // Try multiple price fields in order of preference
  const priceValues = [
    content.price,
    content.price_buybox,
    content.price_initial,
    content.price_upper
  ];
  
  for (const price of priceValues) {
    if (price && typeof price === 'number' && price > 0) {
      return price;
    }
  }
  
  // If there's text about item being unavailable, price is null
  if (content.stock && content.stock.includes('unavailable')) {
    return null;
  }
  
  return null;
}

// Extract original price (if available)
function extractOriginalPrice(content: any): number | null {
  // Original price is usually the higher price if multiple prices exist
  if (content.price_initial && content.price && content.price_initial > content.price) {
    return content.price_initial;
  }
  
  return null;
}

// Extract image URL with safety checks
function extractImageUrl(content: any): string | null {
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    return content.images[0];
  }
  
  return null;
}

// Extract rating with validation
function extractRating(content: any): number | null {
  if (content.rating && typeof content.rating === 'number' && content.rating > 0) {
    return content.rating;
  }
  
  return null;
}

// Extract review count
function extractReviewCount(content: any): number | null {
  if (content.reviews_count && typeof content.reviews_count === 'number') {
    return content.reviews_count;
  }
  
  return content.reviews?.length || 0;
}

// Extract consolidated description text
function extractDescription(content: any): string {
  const descriptionParts = [];
  
  // Add the main description if present
  if (content.description && typeof content.description === 'string') {
    descriptionParts.push(content.description);
  }
  
  // Add bullet points if present
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    descriptionParts.push(content.bullet_points);
  }
  
  return descriptionParts.join('\n\n');
}

// Extract processor information from multiple sources
function extractProcessor(content: any): string | null {
  // Try product details first
  if (content.product_details?.processor && 
      typeof content.product_details.processor === 'string' &&
      content.product_details.processor.length > 0) {
    return content.product_details.processor.replace('‎', '').trim();
  }
  
  // Try to extract from title
  const title = content.title || '';
  const processorPatterns = [
    /intel\s+core\s+i[3579][0-9-]*(?:\s+\d+(?:\.\d+)?(?:GHz)?)?/i,
    /amd\s+ryzen\s+[3579][0-9]*(?:\s+\d+(?:\.\d+)?(?:GHz)?)?/i,
    /apple\s+m[123]\s+(?:pro|max|ultra)?/i
  ];
  
  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of processorPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

// Extract RAM information
function extractRam(content: any): string | null {
  // Try product details first
  if (content.product_details?.ram && 
      typeof content.product_details.ram === 'string' &&
      content.product_details.ram.length > 0) {
    return content.product_details.ram.replace('‎', '').trim();
  }
  
  // Try to extract RAM from title
  const title = content.title || '';
  const ramPattern = /(\d+)\s*GB\s*(?:DDR\d*)?(?:\s*RAM)?/i;
  const match = title.match(ramPattern);
  if (match) {
    return `${match[1]} GB`;
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(ramPattern);
    if (bulletMatch) {
      return `${bulletMatch[1]} GB`;
    }
  }
  
  return null;
}

// Extract storage information
function extractStorage(content: any): string | null {
  // Try product details first
  if (content.product_details?.hard_drive && 
      typeof content.product_details.hard_drive === 'string' &&
      content.product_details.hard_drive.length > 0) {
    return content.product_details.hard_drive.replace('‎', '').trim();
  }
  
  // Try to extract storage from title
  const title = content.title || '';
  const storagePatterns = [
    /(\d+)\s*TB\s*(?:SSD|HDD|NVMe|PCIe)/i,
    /(\d+)\s*GB\s*(?:SSD|HDD|NVMe|PCIe)/i
  ];
  
  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) {
      if (pattern.source.includes('TB')) {
        return `${match[1]} TB`;
      } else {
        return `${match[1]} GB`;
      }
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of storagePatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        if (pattern.source.includes('TB')) {
          return `${match[1]} TB`;
        } else {
          return `${match[1]} GB`;
        }
      }
    }
  }
  
  return null;
}

// Extract screen size
function extractScreenSize(content: any): string | null {
  // Try product details first
  if (content.product_details?.standing_screen_display_size && 
      typeof content.product_details.standing_screen_display_size === 'string' &&
      content.product_details.standing_screen_display_size.length > 0) {
    return content.product_details.standing_screen_display_size.replace('‎', '').trim();
  }
  
  // Try to extract screen size from title
  const title = content.title || '';
  const screenPattern = /(\d+\.?\d*)["-]?(?:\s*inch(?:es)?)?(?:\s*display)?/i;
  const match = title.match(screenPattern);
  if (match && parseFloat(match[1]) > 8 && parseFloat(match[1]) < 30) { // Valid laptop screen sizes
    return `${match[1]}"`;
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(screenPattern);
    if (bulletMatch && parseFloat(bulletMatch[1]) > 8 && parseFloat(bulletMatch[1]) < 30) {
      return `${bulletMatch[1]}"`;
    }
  }
  
  return null;
}

// Extract screen resolution
function extractScreenResolution(content: any): string | null {
  // Try to extract resolution from title
  const title = content.title || '';
  const resolutionPatterns = [
    /(\d+)\s*x\s*(\d+)/i,
    /4K|UHD|QHD|FHD|HD\+|Full\s*HD|Retina/i
  ];
  
  for (const pattern of resolutionPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of resolutionPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

// Extract graphics card information
function extractGraphics(content: any): string | null {
  // Try product details first
  if (content.product_details?.card_description && 
      typeof content.product_details.card_description === 'string' &&
      content.product_details.card_description.length > 0) {
    return content.product_details.card_description.replace('‎', '').trim();
  }
  
  // Try to extract graphics from title
  const title = content.title || '';
  const graphicsPatterns = [
    /NVIDIA\s+(?:GeForce\s+)?(?:RTX|GTX)\s+\d{3,4}(?:\s*Ti)?(?:\s*Super)?/i,
    /AMD\s+Radeon\s+(?:RX\s+)?\d{3,4}(?:\s*XT)?/i,
    /Intel\s+(?:UHD|Iris\s+Xe)\s+Graphics/i,
    /Apple\s+M[123]\s+(?:GPU|Graphics)/i
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of graphicsPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

// Extract weight information
function extractWeight(content: any): string | null {
  // Try product details first
  if (content.product_details?.item_weight && 
      typeof content.product_details.item_weight === 'string' &&
      content.product_details.item_weight.length > 0) {
    return content.product_details.item_weight.replace('‎', '').trim();
  }
  
  // Try to extract weight from title
  const title = content.title || '';
  const weightPattern = /(\d+\.?\d*)\s*(?:pounds|lbs)/i;
  const match = title.match(weightPattern);
  if (match) {
    return `${match[1]} pounds`;
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletMatch = content.bullet_points.match(weightPattern);
    if (bulletMatch) {
      return `${bulletMatch[1]} pounds`;
    }
  }
  
  return null;
}

// Extract operating system
function extractOS(content: any): string | null {
  // Try product details first
  if (content.product_details?.operating_system && 
      typeof content.product_details.operating_system === 'string' &&
      content.product_details.operating_system.length > 0) {
    return content.product_details.operating_system.replace('‎', '').trim();
  }
  
  // Try to extract OS from title or description
  const textToSearch = content.title || '';
  const osPatterns = [
    /Windows\s+(?:10|11)\s+(?:Home|Pro)/i,
    /macOS|Mac\s+OS/i,
    /Chrome\s*OS/i,
    /Linux/i
  ];
  
  for (const pattern of osPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Try bullet points as last resort
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    for (const pattern of osPatterns) {
      const match = content.bullet_points.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  return null;
}

// Detect if the laptop has a touchscreen
function extractTouchscreen(content: any): boolean | null {
  const textToSearch = [
    content.title || '',
    content.bullet_points || '',
    content.description || ''
  ].join(' ');
  
  const touchscreenPatterns = [
    /touchscreen/i,
    /touch\s+screen/i,
    /touch\s+display/i,
    /touch\s+enabled/i
  ];
  
  for (const pattern of touchscreenPatterns) {
    if (pattern.test(textToSearch)) {
      return true;
    }
  }
  
  // Only return false if we're confident (e.g., when it specifically says non-touch)
  if (/non[\-\s]touch/i.test(textToSearch)) {
    return false;
  }
  
  return null; // Return null if uncertain
}

// Extract color information
function extractColor(content: any): string | null {
  const colorPatterns = [
    /black(?!\s+keyboard)/i,
    /silver/i,
    /gray|grey/i,
    /white/i,
    /blue/i,
    /red/i,
    /pink/i,
    /gold/i,
    /space\s+gray/i,
    /rose\s+gold/i
  ];
  
  // Try to find color in title
  const title = content.title || '';
  for (const pattern of colorPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1);
    }
  }
  
  // Try product details, description, or bullet points
  const textToSearch = [
    content.description || '',
    content.bullet_points || ''
  ].join(' ');
  
  for (const pattern of colorPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      return match[0].charAt(0).toUpperCase() + match[0].slice(1);
    }
  }
  
  return null;
}

// Extract review data
function extractReviewData(content: any): any {
  const reviewData = {
    rating_breakdown: {},
    recent_reviews: []
  };
  
  // Add review breakdown if available
  if (content.rating_stars_distribution && Array.isArray(content.rating_stars_distribution)) {
    content.rating_stars_distribution.forEach((distribution: any) => {
      if (distribution && distribution.key && distribution.value) {
        reviewData.rating_breakdown[distribution.key] = distribution.value;
      }
    });
  }
  
  // Add individual reviews if available
  if (content.reviews && Array.isArray(content.reviews)) {
    reviewData.recent_reviews = content.reviews.map((review: any) => ({
      rating: review.rating || 0,
      title: review.title || '',
      content: review.content || '',
      reviewer_name: review.reviewer_name || 'Anonymous',
      review_date: review.date || new Date().toISOString(),
      verified_purchase: review.verified_purchase || false,
      helpful_votes: review.helpful_votes || 0
    }));
  }
  
  return reviewData;
}


import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { LaptopUpdate, UpdateResult, UpdateStats } from "./types.ts";

/**
 * Update a laptop product in the database with enhanced data processing
 */
export async function updateProductInDatabase(
  supabase: ReturnType<typeof createClient>,
  laptop: LaptopUpdate,
  apiData: any
): Promise<UpdateResult> {
  try {
    console.log(`Processing data for ASIN ${laptop.asin}...`);
    
    // Get the current product data from the database
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', laptop.id)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching existing product ${laptop.asin}:`, fetchError);
      return { 
        success: false, 
        error: fetchError.message,
        priceUpdated: false,
        imageUpdated: false,
        specsUpdated: false
      };
    }
    
    // Extract product data from API response
    const content = apiData.results[0].content;
    
    // Process the data with enhanced extraction
    const updates: Record<string, any> = {
      last_checked: new Date().toISOString(),
      update_status: 'completed'
    };
    
    let priceUpdated = false;
    let imageUpdated = false;
    let specsUpdated = false;
    
    // Price extraction (with safety checks)
    const extractedPrice = extractPrice(content);
    if (extractedPrice !== null && extractedPrice !== undefined) {
      // Only update price if:
      // 1. Current price in DB is null/undefined, OR
      // 2. New price is different from current price
      if (existingProduct.current_price === null || 
          existingProduct.current_price === undefined || 
          Math.abs(existingProduct.current_price - extractedPrice) > 0.01) {
        
        updates.current_price = extractedPrice;
        priceUpdated = true;
        
        // If price changed, store in price history
        if (existingProduct.current_price !== null && 
            existingProduct.current_price !== undefined) {
          await supabase
            .from('price_history')
            .insert({
              product_id: laptop.id,
              price: extractedPrice,
              timestamp: new Date().toISOString()
            });
        }
        
        console.log(`Updated price for ${laptop.asin}: $${existingProduct.current_price} -> $${extractedPrice}`);
      }
    }
    
    // Image URL extraction (with safety checks)
    const imageUrl = extractImageUrl(content);
    if (imageUrl && (!existingProduct.image_url || existingProduct.image_url !== imageUrl)) {
      updates.image_url = imageUrl;
      imageUpdated = true;
      console.log(`Updated image for ${laptop.asin}: ${imageUrl}`);
    }
    
    // Extract and update product_url if missing
    if (!existingProduct.product_url) {
      const productUrl = content.url || `https://www.amazon.com/dp/${laptop.asin}`;
      updates.product_url = productUrl;
    }
    
    // Extract enhanced specifications
    const enhancedSpecs = extractEnhancedSpecs(content, existingProduct);
    
    // Only update specs if we actually got new information
    if (enhancedSpecs && Object.keys(enhancedSpecs).length > 0) {
      Object.assign(updates, enhancedSpecs);
      specsUpdated = true;
      console.log(`Updated specifications for ${laptop.asin}:`, 
        Object.keys(enhancedSpecs).join(', '));
    }
    
    // Extract review data if available
    const reviewData = extractReviewData(content);
    if (reviewData) {
      updates.review_data = reviewData;
      updates.average_rating = content.rating || null;
      updates.total_reviews = content.reviews_count || 0;
    }
    
    // Update processor score and benchmark score if we have processor info
    if (updates.processor && updates.processor !== existingProduct.processor) {
      updates.processor_score = calculateProcessorScore(updates.processor);
    }
    
    if (updates.processor || updates.ram || updates.storage || updates.graphics) {
      updates.benchmark_score = calculateBenchmarkScore({
        ...existingProduct,
        ...updates
      });
    }
    
    // Only update if we have changes
    if (Object.keys(updates).length > 1) { // More than just update_status
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', laptop.id);
      
      if (updateError) {
        console.error(`Error updating product ${laptop.asin}:`, updateError);
        return { 
          success: false, 
          error: updateError.message,
          priceUpdated,
          imageUpdated,
          specsUpdated
        };
      }
      
      console.log(`Successfully updated product ${laptop.asin} with ${Object.keys(updates).length - 1} fields`);
      return { 
        success: true,
        priceUpdated,
        imageUpdated,
        specsUpdated
      };
    } else {
      // No changes except status, still update status
      const { error: statusUpdateError } = await supabase
        .from('products')
        .update({ update_status: 'completed' })
        .eq('id', laptop.id);
      
      if (statusUpdateError) {
        console.error(`Error updating status for ${laptop.asin}:`, statusUpdateError);
      }
      
      console.log(`No updates needed for product ${laptop.asin}`);
      return { 
        success: true,
        priceUpdated: false,
        imageUpdated: false,
        specsUpdated: false
      };
    }
  } catch (error) {
    console.error(`Error in updateProductInDatabase for ${laptop.asin}:`, error);
    
    // Update status to error
    await supabase
      .from('products')
      .update({ update_status: 'error' })
      .eq('id', laptop.id);
    
    return { 
      success: false, 
      error: error.message,
      priceUpdated: false,
      imageUpdated: false,
      specsUpdated: false
    };
  }
}

/**
 * Extract price from API response with robust fallbacks
 */
function extractPrice(content: any): number | null {
  // Try different price fields in order of preference
  const priceFields = ['price', 'price_buybox', 'price_sns', 'price_initial'];
  
  for (const field of priceFields) {
    const price = content[field];
    if (typeof price === 'number' && price > 0) {
      return price;
    }
  }
  
  // Try to extract from price string if numeric fields aren't available
  if (content.pricing_str) {
    const priceMatch = content.pricing_str.match(/\$(\d+\.\d+)/);
    if (priceMatch && priceMatch[1]) {
      const price = parseFloat(priceMatch[1]);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
  }
  
  // If stock says unavailable, price is truly null
  if (content.stock && content.stock.includes('unavailable')) {
    return null;
  }
  
  return null;
}

/**
 * Extract image URL from API response
 */
function extractImageUrl(content: any): string | null {
  if (content.images && Array.isArray(content.images) && content.images.length > 0) {
    // Choose the first image URL
    return content.images[0];
  }
  
  return null;
}

/**
 * Extract enhanced specifications from API response
 */
function extractEnhancedSpecs(content: any, existingProduct: any): Record<string, any> {
  const specs: Record<string, any> = {};
  
  // Function to add spec if it doesn't exist or is different
  const addSpec = (field: string, value: any) => {
    if (value && (!existingProduct[field] || existingProduct[field] !== value)) {
      specs[field] = value;
    }
  };
  
  // Extract specifications from title
  if (content.title) {
    // Extract brand if missing
    if (!existingProduct.brand) {
      const brandMatch = content.title.match(/^(dell|hp|lenovo|asus|acer|apple|microsoft|razer|msi|samsung|lg)/i);
      if (brandMatch) {
        addSpec('brand', brandMatch[1].charAt(0).toUpperCase() + brandMatch[1].slice(1).toLowerCase());
      } else if (content.brand) {
        addSpec('brand', content.brand);
      }
    }
    
    // Extract processor if missing
    if (!existingProduct.processor) {
      const processorPatterns = [
        /intel\s+core\s+i[3579][\-\s]\d{4,5}(?:[A-Z])?/i,
        /ryzen\s+[3579]\s+\d{4}(?:[A-Z])?/i,
        /apple\s+m[123](?:\s+(?:pro|max|ultra))?/i
      ];
      
      for (const pattern of processorPatterns) {
        const match = content.title.match(pattern);
        if (match) {
          addSpec('processor', match[0]);
          break;
        }
      }
    }
    
    // Extract RAM if missing
    if (!existingProduct.ram) {
      const ramMatch = content.title.match(/(\d+)\s*GB\s+RAM/i);
      if (ramMatch) {
        addSpec('ram', `${ramMatch[1]} GB`);
      }
    }
    
    // Extract storage if missing
    if (!existingProduct.storage) {
      const storagePatterns = [
        /(\d+)\s*TB\s+(?:SSD|HDD|Storage)/i,
        /(\d+)\s*GB\s+(?:SSD|HDD|Storage)/i
      ];
      
      for (const pattern of storagePatterns) {
        const match = content.title.match(pattern);
        if (match) {
          if (pattern.source.includes('TB')) {
            addSpec('storage', `${match[1]} TB`);
          } else {
            addSpec('storage', `${match[1]} GB`);
          }
          break;
        }
      }
    }
    
    // Extract screen size if missing
    if (!existingProduct.screen_size) {
      const screenMatch = content.title.match(/(\d+\.?\d*)[\s"]*(?:inch|"|in)/i);
      if (screenMatch) {
        addSpec('screen_size', `${screenMatch[1]}"`);
      }
    }
    
    // Extract screen resolution if missing
    if (!existingProduct.screen_resolution) {
      const resolutionPatterns = [
        /(\d+)\s*x\s*(\d+)/i,
        /4K|UHD|QHD|FHD|1080p|1440p|2160p/i
      ];
      
      for (const pattern of resolutionPatterns) {
        const match = content.title.match(pattern);
        if (match) {
          addSpec('screen_resolution', match[0]);
          break;
        }
      }
    }
  }
  
  // Extract from product details if available
  if (content.product_details) {
    const details = content.product_details;
    
    // Map product details to fields
    const fieldMappings = [
      { source: 'processor_brand', target: 'processor' },
      { source: 'processor', target: 'processor' },
      { source: 'ram', target: 'ram' },
      { source: 'hard_drive', target: 'storage' },
      { source: 'graphics_coprocessor', target: 'graphics' },
      { source: 'card_description', target: 'graphics' },
      { source: 'standing_screen_display_size', target: 'screen_size' },
      { source: 'resolution', target: 'screen_resolution' },
      { source: 'screen_resolution', target: 'screen_resolution' },
      { source: 'operating_system', target: 'operating_system' },
      { source: 'item_weight', target: 'weight' },
      { source: 'brand', target: 'brand' },
      { source: 'series', target: 'model' }
    ];
    
    for (const mapping of fieldMappings) {
      if (details[mapping.source] && 
          typeof details[mapping.source] === 'string' && 
          details[mapping.source].trim().length > 0) {
        // Clean up the value (remove leading '‎' characters)
        const cleanValue = details[mapping.source].replace(/^‎/, '').trim();
        addSpec(mapping.target, cleanValue);
      }
    }
  }
  
  // Extract from bullet points if available
  if (content.bullet_points && typeof content.bullet_points === 'string') {
    const bulletPoints = content.bullet_points;
    
    // Only extract from bullet points if we're still missing key specs
    if (!existingProduct.processor && !specs.processor) {
      const processorMatch = bulletPoints.match(/(?:Intel|AMD|Apple)[\s\w]+(?:i[3579][\-\s]\d{4,5}|Ryzen\s+[3579]\s+\d{4}|M[123](?:\s+(?:Pro|Max|Ultra))?)/i);
      if (processorMatch) {
        addSpec('processor', processorMatch[0]);
      }
    }
    
    if (!existingProduct.ram && !specs.ram) {
      const ramMatch = bulletPoints.match(/(\d+)\s*GB\s+(?:DDR\d+\s+)?RAM/i);
      if (ramMatch) {
        addSpec('ram', `${ramMatch[1]} GB`);
      }
    }
    
    if (!existingProduct.storage && !specs.storage) {
      const storageMatch = bulletPoints.match(/(\d+)\s*(?:TB|GB)\s+(?:SSD|HDD|PCIe|NVMe)/i);
      if (storageMatch) {
        addSpec('storage', storageMatch[0]);
      }
    }
    
    if (!existingProduct.graphics && !specs.graphics) {
      const graphicsMatch = bulletPoints.match(/(?:NVIDIA|Intel|AMD|Apple)[\s\w]+(?:Graphics|GTX|RTX|Radeon|Iris|UHD)/i);
      if (graphicsMatch) {
        addSpec('graphics', graphicsMatch[0]);
      }
    }
  }
  
  return specs;
}

/**
 * Extract review data from API response
 */
function extractReviewData(content: any): Record<string, any> | null {
  if (!content.reviews || !Array.isArray(content.reviews)) {
    return null;
  }
  
  const reviewData: Record<string, any> = {
    rating_breakdown: {},
    recent_reviews: []
  };
  
  // Process rating distribution if available
  if (content.rating_stars_distribution && Array.isArray(content.rating_stars_distribution)) {
    content.rating_stars_distribution.forEach((dist: any) => {
      if (dist && dist.key && dist.value) {
        reviewData.rating_breakdown[dist.key] = dist.value;
      }
    });
  }
  
  // Process individual reviews
  if (content.reviews.length > 0) {
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

/**
 * Calculate a processor score based on the extracted processor information
 */
function calculateProcessorScore(processor: string): number {
  processor = processor.toLowerCase();
  
  // Intel Core i9
  if (processor.includes('i9')) {
    return 90;
  }
  // AMD Ryzen 9
  if (processor.includes('ryzen 9')) {
    return 88;
  }
  // Apple M3 variants
  if (processor.includes('m3 ultra')) {
    return 95;
  }
  if (processor.includes('m3 max')) {
    return 92;
  }
  if (processor.includes('m3 pro')) {
    return 88;
  }
  if (processor.includes('m3')) {
    return 85;
  }
  // Intel Core i7
  if (processor.includes('i7')) {
    return 80;
  }
  // AMD Ryzen 7
  if (processor.includes('ryzen 7')) {
    return 78;
  }
  // Apple M2 variants
  if (processor.includes('m2 max')) {
    return 85;
  }
  if (processor.includes('m2 pro')) {
    return 82;
  }
  if (processor.includes('m2')) {
    return 78;
  }
  // Intel Core i5
  if (processor.includes('i5')) {
    return 70;
  }
  // AMD Ryzen 5
  if (processor.includes('ryzen 5')) {
    return 68;
  }
  // Apple M1 variants
  if (processor.includes('m1')) {
    return 72;
  }
  // Intel Core i3
  if (processor.includes('i3')) {
    return 50;
  }
  // AMD Ryzen 3
  if (processor.includes('ryzen 3')) {
    return 48;
  }
  // Budget processors
  if (processor.includes('celeron') || processor.includes('pentium')) {
    return 30;
  }
  
  // Default for unknown processors
  return 40;
}

/**
 * Calculate a benchmark score based on various laptop specifications
 */
function calculateBenchmarkScore(laptop: Record<string, any>): number {
  let score = 0;
  
  // Processor (0-35 points)
  if (laptop.processor_score) {
    score += laptop.processor_score * 0.35;
  } else if (laptop.processor) {
    score += calculateProcessorScore(laptop.processor) * 0.35;
  }
  
  // RAM (0-20 points)
  if (laptop.ram) {
    const ramMatch = laptop.ram.match(/(\d+)\s*GB/i);
    if (ramMatch) {
      const ramSize = parseInt(ramMatch[1], 10);
      if (ramSize >= 32) {
        score += 20;
      } else if (ramSize >= 16) {
        score += 15;
      } else if (ramSize >= 8) {
        score += 10;
      } else if (ramSize >= 4) {
        score += 5;
      }
    }
  }
  
  // Storage (0-15 points)
  if (laptop.storage) {
    // SSD type bonus
    if (/NVMe|PCIe/i.test(laptop.storage)) {
      score += 5;
    } else if (/SSD/i.test(laptop.storage)) {
      score += 3;
    }
    
    // Storage capacity
    const tbMatch = laptop.storage.match(/(\d+(?:\.\d+)?)\s*TB/i);
    const gbMatch = laptop.storage.match(/(\d+)\s*GB/i);
    
    if (tbMatch) {
      const tbSize = parseFloat(tbMatch[1]);
      if (tbSize >= 2) {
        score += 10;
      } else if (tbSize >= 1) {
        score += 8;
      } else {
        score += 6;
      }
    } else if (gbMatch) {
      const gbSize = parseInt(gbMatch[1], 10);
      if (gbSize >= 1000) {
        score += 8;
      } else if (gbSize >= 512) {
        score += 6;
      } else if (gbSize >= 256) {
        score += 4;
      } else if (gbSize >= 128) {
        score += 2;
      }
    }
  }
  
  // Graphics (0-20 points)
  if (laptop.graphics) {
    const graphics = laptop.graphics.toLowerCase();
    
    // High-end GPU
    if (graphics.includes('rtx 40') || graphics.includes('radeon rx 7')) {
      score += 20;
    }
    // Upper mid-range GPU
    else if (graphics.includes('rtx 30') || graphics.includes('radeon rx 6')) {
      score += 16;
    }
    // Mid-range GPU
    else if (graphics.includes('rtx 20') || graphics.includes('gtx 16') || 
             graphics.includes('radeon rx 5')) {
      score += 12;
    }
    // Entry dedicated GPU
    else if (graphics.includes('gtx') || graphics.includes('mx') || 
             graphics.includes('radeon')) {
      score += 8;
    }
    // Integrated graphics
    else if (graphics.includes('iris') || graphics.includes('m1') || 
             graphics.includes('m2') || graphics.includes('m3')) {
      score += 5;
    }
    // Basic integrated
    else if (graphics.includes('uhd') || graphics.includes('hd')) {
      score += 3;
    }
  }
  
  // Screen resolution (0-10 points)
  if (laptop.screen_resolution) {
    const resolution = laptop.screen_resolution.toLowerCase();
    
    if (resolution.includes('4k') || resolution.includes('uhd') || 
        resolution.includes('3840 x 2160')) {
      score += 10;
    }
    else if (resolution.includes('2k') || resolution.includes('qhd') || 
             resolution.includes('2560 x 1440')) {
      score += 7;
    }
    else if (resolution.includes('fhd') || resolution.includes('1080p') || 
             resolution.includes('1920 x 1080')) {
      score += 5;
    }
    else if (resolution.includes('hd')) {
      score += 2;
    }
  }
  
  return Math.round(score);
}

/**
 * Log statistics about update operations
 */
export function logUpdateStats(results: UpdateResult[]): UpdateStats {
  const stats: UpdateStats = {
    total: results.length,
    successful: 0,
    failed: 0,
    priceUpdated: 0,
    imageUpdated: 0,
    specsUpdated: 0
  };
  
  results.forEach(result => {
    if (result.success) {
      stats.successful++;
      if (result.priceUpdated) stats.priceUpdated++;
      if (result.imageUpdated) stats.imageUpdated++;
      if (result.specsUpdated) stats.specsUpdated++;
    } else {
      stats.failed++;
    }
  });
  
  console.log(`Update statistics: ${stats.successful}/${stats.total} successful (${stats.priceUpdated} prices, ${stats.imageUpdated} images, ${stats.specsUpdated} specs updated)`);
  
  return stats;
}

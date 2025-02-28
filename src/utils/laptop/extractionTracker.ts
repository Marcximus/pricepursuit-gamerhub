
// Extraction success/failure tracking
interface ExtractionStats {
  totalProcessed: number;
  successByField: Record<string, number>;
  failureByField: Record<string, number>;
  conversionRates: Record<string, number>;
}

let extractionStats: ExtractionStats = {
  totalProcessed: 0,
  successByField: {
    processor: 0,
    ram: 0,
    storage: 0,
    graphics: 0,
    screen_size: 0,
    price: 0,
    image_url: 0
  },
  failureByField: {
    processor: 0,
    ram: 0,
    storage: 0,
    graphics: 0,
    screen_size: 0,
    price: 0,
    image_url: 0
  },
  conversionRates: {}
};

/**
 * Track success or failure of a field extraction
 */
export function trackExtraction(field: string, success: boolean): void {
  if (success) {
    extractionStats.successByField[field] = (extractionStats.successByField[field] || 0) + 1;
  } else {
    extractionStats.failureByField[field] = (extractionStats.failureByField[field] || 0) + 1;
  }
}

/**
 * Track processing of a complete laptop record
 */
export function trackLaptopProcessed(
  laptop: any,
  extractedData: any
): void {
  extractionStats.totalProcessed++;
  
  // Track individual fields
  trackExtraction('processor', !!extractedData.processor);
  trackExtraction('ram', !!extractedData.ram);
  trackExtraction('storage', !!extractedData.storage);
  trackExtraction('graphics', !!extractedData.graphics);
  trackExtraction('screen_size', !!extractedData.screen_size);
  trackExtraction('price', !!extractedData.current_price);
  trackExtraction('image_url', !!extractedData.image_url);
  
  // Update conversion rates
  updateConversionRates();
}

/**
 * Update conversion rate statistics
 */
function updateConversionRates(): void {
  const fields = Object.keys(extractionStats.successByField);
  fields.forEach(field => {
    const success = extractionStats.successByField[field] || 0;
    const failure = extractionStats.failureByField[field] || 0;
    const total = success + failure;
    
    if (total > 0) {
      extractionStats.conversionRates[field] = Math.round((success / total) * 100);
    } else {
      extractionStats.conversionRates[field] = 0;
    }
  });
}

/**
 * Get current extraction statistics
 */
export function getExtractionStats(): ExtractionStats {
  return { ...extractionStats };
}

/**
 * Reset extraction statistics
 */
export function resetExtractionStats(): void {
  extractionStats = {
    totalProcessed: 0,
    successByField: {
      processor: 0,
      ram: 0,
      storage: 0,
      graphics: 0,
      screen_size: 0,
      price: 0,
      image_url: 0
    },
    failureByField: {
      processor: 0,
      ram: 0,
      storage: 0,
      graphics: 0,
      screen_size: 0,
      price: 0,
      image_url: 0
    },
    conversionRates: {}
  };
}

/**
 * Log extraction statistics to console
 */
export function logExtractionStats(): void {
  console.log('📊 EXTRACTION STATISTICS');
  console.log(`Total laptops processed: ${extractionStats.totalProcessed}`);
  
  console.log('\nField Success Rates:');
  Object.entries(extractionStats.conversionRates).forEach(([field, rate]) => {
    let emoji = '❓';
    if (rate >= 90) emoji = '🟢';
    else if (rate >= 70) emoji = '🟡';
    else if (rate >= 50) emoji = '🟠';
    else emoji = '🔴';
    
    console.log(`${emoji} ${field}: ${rate}% (${extractionStats.successByField[field]}/${extractionStats.successByField[field] + extractionStats.failureByField[field]})`);
  });
  
  console.log('\nRecommendations:');
  Object.entries(extractionStats.conversionRates)
    .filter(([_, rate]) => rate < 70)
    .forEach(([field]) => {
      console.log(`⚠️ Improve extraction for ${field} - current success rate is too low`);
    });
}

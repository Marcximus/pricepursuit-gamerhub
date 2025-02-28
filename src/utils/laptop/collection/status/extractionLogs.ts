
/**
 * Log extraction results from raw data to processed data
 * @param rawData The original data from the API
 * @param processed The processed product data
 */
export function logExtractionDetails(rawData: any, processed: any) {
  console.log(`\n🔬 DATA EXTRACTION ANALYSIS:`);
  
  // Check for title extraction
  if (rawData.title && processed.title) {
    console.log(`✅ Title extraction: "${rawData.title}" → "${processed.title}"`);
  } else {
    console.log(`❌ Title extraction failed`);
  }
  
  // Check for specs extraction
  const specsChecklist = [
    { name: 'Brand', raw: rawData.brand, processed: processed.brand },
    { name: 'Model', raw: rawData.model, processed: processed.model },
    { name: 'Processor', raw: rawData.processor, processed: processed.processor },
    { name: 'RAM', raw: rawData.ram, processed: processed.ram },
    { name: 'Storage', raw: rawData.storage, processed: processed.storage },
    { name: 'Graphics', raw: rawData.graphics, processed: processed.graphics },
    { name: 'Screen Size', raw: rawData.screen_size, processed: processed.screen_size }
  ];
  
  // Count successful extractions
  const successfulExtractions = specsChecklist.filter(item => !!item.processed).length;
  const totalSpecs = specsChecklist.length;
  const extractionPercentage = Math.round((successfulExtractions/totalSpecs)*100);
  
  // Choose emoji based on extraction percentage
  let extractionEmoji = '🔴';
  if (extractionPercentage >= 75) extractionEmoji = '🟢';
  else if (extractionPercentage >= 50) extractionEmoji = '🟡';
  else if (extractionPercentage >= 25) extractionEmoji = '🟠';
  
  console.log(`${extractionEmoji} Extraction rate: ${successfulExtractions}/${totalSpecs} specs (${extractionPercentage}%)`);
  
  // Log each spec extraction attempt
  specsChecklist.forEach(spec => {
    const success = !!spec.processed;
    const emoji = success ? '✅' : '❌';
    const rawValue = spec.raw || 'null';
    const processedValue = spec.processed || 'null';
    
    if (success) {
      console.log(`${emoji} ${spec.name}: "${rawValue}" → "${processedValue}"`);
    } else {
      if (spec.raw) {
        console.log(`${emoji} ${spec.name}: Failed to extract from "${rawValue}"`);
      } else {
        console.log(`${emoji} ${spec.name}: No data available in source`);
      }
    }
  });
  
  // Log source for successful extractions
  console.log(`\n📋 EXTRACTION SOURCES:`);
  specsChecklist.forEach(spec => {
    if (spec.processed) {
      const source = spec.raw ? '📄 Direct data' : '🔍 Title extraction';
      console.log(`🔄 ${spec.name}: ${source}`);
    }
  });
  
  // Add timestamp
  console.log(`\n⏱️ Extraction completed at: ${new Date().toLocaleTimeString()}`);
  console.log(`\n`);
}

/**
 * Log data extraction performance metrics
 * @param products Array of products processed
 */
export function logExtractionPerformance(products: any[]) {
  if (!products || products.length === 0) {
    console.log(`⚠️ No products to analyze extraction performance`);
    return;
  }

  const totalProducts = products.length;
  const missingFields = {
    brand: 0,
    model: 0,
    processor: 0,
    ram: 0,
    storage: 0,
    graphics: 0,
    screen_size: 0,
    price: 0
  };
  
  // Count missing fields
  products.forEach(product => {
    if (!product.brand || product.brand === '') missingFields.brand++;
    if (!product.model || product.model === '') missingFields.model++;
    if (!product.processor || product.processor === '') missingFields.processor++;
    if (!product.ram || product.ram === '') missingFields.ram++;
    if (!product.storage || product.storage === '') missingFields.storage++;
    if (!product.graphics || product.graphics === '') missingFields.graphics++;
    if (!product.screen_size || product.screen_size === '') missingFields.screen_size++;
    if (!product.current_price) missingFields.price++;
  });
  
  // Calculate percentages
  const percentages = {
    brand: Math.round((missingFields.brand / totalProducts) * 100),
    model: Math.round((missingFields.model / totalProducts) * 100),
    processor: Math.round((missingFields.processor / totalProducts) * 100),
    ram: Math.round((missingFields.ram / totalProducts) * 100),
    storage: Math.round((missingFields.storage / totalProducts) * 100),
    graphics: Math.round((missingFields.graphics / totalProducts) * 100),
    screen_size: Math.round((missingFields.screen_size / totalProducts) * 100),
    price: Math.round((missingFields.price / totalProducts) * 100)
  };
  
  console.log(`\n📊 EXTRACTION PERFORMANCE METRICS (${totalProducts} products):`);
  
  // Add emojis based on missing percentage
  const getStatusEmoji = (percentage: number) => {
    if (percentage <= 10) return '🟢';
    if (percentage <= 30) return '🟡';
    if (percentage <= 50) return '🟠';
    return '🔴';
  };
  
  console.log(`  ${getStatusEmoji(percentages.brand)} Missing Brand: ${missingFields.brand}/${totalProducts} (${percentages.brand}%)`);
  console.log(`  ${getStatusEmoji(percentages.model)} Missing Model: ${missingFields.model}/${totalProducts} (${percentages.model}%)`);
  console.log(`  ${getStatusEmoji(percentages.processor)} Missing Processor: ${missingFields.processor}/${totalProducts} (${percentages.processor}%)`);
  console.log(`  ${getStatusEmoji(percentages.ram)} Missing RAM: ${missingFields.ram}/${totalProducts} (${percentages.ram}%)`);
  console.log(`  ${getStatusEmoji(percentages.storage)} Missing Storage: ${missingFields.storage}/${totalProducts} (${percentages.storage}%)`);
  console.log(`  ${getStatusEmoji(percentages.graphics)} Missing Graphics: ${missingFields.graphics}/${totalProducts} (${percentages.graphics}%)`);
  console.log(`  ${getStatusEmoji(percentages.screen_size)} Missing Screen Size: ${missingFields.screen_size}/${totalProducts} (${percentages.screen_size}%)`);
  console.log(`  ${getStatusEmoji(percentages.price)} Missing Price: ${missingFields.price}/${totalProducts} (${percentages.price}%)`);
  
  // Average completion rate
  const fields = Object.keys(missingFields).length;
  const totalMissingPercentage = Object.values(percentages).reduce((sum, val) => sum + val, 0);
  const averageMissingRate = Math.round(totalMissingPercentage / fields);
  const averageCompletionRate = 100 - averageMissingRate;
  
  // Choose emoji based on completion rate
  let completionEmoji = '🔴';
  if (averageCompletionRate >= 90) completionEmoji = '🌟';
  else if (averageCompletionRate >= 75) completionEmoji = '🟢';
  else if (averageCompletionRate >= 50) completionEmoji = '🟡';
  else if (averageCompletionRate >= 25) completionEmoji = '🟠';
  
  console.log(`\n📈 OVERALL DATA QUALITY:`);
  console.log(`  ${completionEmoji} Average completion rate: ${averageCompletionRate}%`);
  
  // Analysis of extraction issues
  console.log(`\n🔍 EXTRACTION ISSUE ANALYSIS:`);
  
  // Find the most problematic fields
  const sortedFields = Object.entries(percentages)
    .sort(([, a], [, b]) => b - a)
    .map(([field, percentage]) => ({ field, percentage }));
  
  console.log(`  Most problematic fields:`);
  sortedFields.slice(0, 3).forEach((item, index) => {
    const problemEmoji = item.percentage >= 50 ? '🚨' : item.percentage >= 30 ? '⚠️' : '📝';
    console.log(`  ${index + 1}. ${problemEmoji} ${item.field}: ${item.percentage}% missing`);
  });
  
  console.log(`\n🛠️ RECOMMENDED IMPROVEMENTS:`);
  
  if (percentages.processor > 50) {
    console.log(`  ⚙️ Enhance processor extraction patterns to recognize more CPU variants`);
  }
  if (percentages.ram > 50) {
    console.log(`  ⚙️ Improve RAM extraction to better handle various formats (e.g., "16 GB", "16GB", "16G")`);
  }
  if (percentages.storage > 50) {
    console.log(`  ⚙️ Refine storage extraction to recognize complex patterns (e.g., "512GB SSD + 1TB HDD")`);
  }
  if (percentages.graphics > 50) {
    console.log(`  ⚙️ Enhance graphics card recognition for integrated and discrete GPUs`);
  }
  
  // Add timestamp
  console.log(`\n⏱️ Analysis completed at: ${new Date().toLocaleTimeString()}`);
  console.log('\n');
}

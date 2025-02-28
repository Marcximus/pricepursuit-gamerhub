
/**
 * Logs detailed information about a laptop processing operation
 */
export function logLaptopProcessingDetails(
  asin: string,
  title: string | null | undefined,
  extractedData: any,
  existingData: any
) {
  console.log(`\n🔍 PROCESSING DETAILS FOR ASIN: ${asin}`);
  console.log(`📄 Title: ${title || 'N/A'}`);

  // Display extraction results
  console.log('\n📊 EXTRACTION RESULTS:');
  
  const fields = [
    { name: 'Processor', key: 'processor' },
    { name: 'RAM', key: 'ram' },
    { name: 'Storage', key: 'storage' },
    { name: 'Graphics', key: 'graphics' },
    { name: 'Screen Size', key: 'screen_size' },
    { name: 'Brand', key: 'brand' },
    { name: 'Model', key: 'model' },
    { name: 'Image URL', key: 'image_url' },
    { name: 'Price', key: 'current_price' }
  ];

  fields.forEach(field => {
    const existingValue = existingData ? existingData[field.key] : null;
    const extractedValue = extractedData ? extractedData[field.key] : null;
    
    // Determine status icons
    const existingIcon = existingValue ? '✅' : '❌';
    const extractedIcon = extractedValue ? '✅' : '❌';
    const updatedIcon = (existingValue !== extractedValue && extractedValue) ? '🔄' : ''; 
    
    console.log(`${field.name}:`);
    console.log(`  - Existing: ${existingIcon} ${existingValue || 'NULL'}`);
    console.log(`  - Extracted: ${extractedIcon} ${extractedValue || 'NULL'}`);
    if (updatedIcon) {
      console.log(`  ${updatedIcon} Value updated!`);
    }
  });
  
  // Special diagnostic section for problematic fields
  if (!extractedData.image_url) {
    console.log('\n⚠️ IMAGE URL EXTRACTION FAILED:');
    console.log('  - Check if the data source contains image URLs');
    console.log('  - Verify that the image URL extraction patterns are correctly configured');
    console.log('  - Consider checking the raw data payload for available image data');
  }
  
  if (!extractedData.processor || !extractedData.ram || !extractedData.storage || !extractedData.graphics) {
    console.log('\n⚠️ CRITICAL SPECIFICATIONS MISSING:');
    console.log('  - Major hardware specifications could not be extracted');
    console.log('  - Source data may not contain sufficient technical details');
    console.log('  - Consider enhancing the extraction patterns or source quality');
  }
  
  console.log('\n--------------------------------------------------\n');
}

/**
 * Logs a summary of laptop data extraction results
 */
export function logExtractionSummary(
  processedCount: number,
  successCount: number,
  missingImageCount: number,
  missingSpecsCount: number
) {
  console.log('\n📋 LAPTOP DATA EXTRACTION SUMMARY');
  console.log(`🔢 Total laptops processed: ${processedCount}`);
  console.log(`✅ Successfully extracted data: ${successCount} (${Math.round((successCount/processedCount)*100)}%)`);
  console.log(`🖼️ Missing image URLs: ${missingImageCount} (${Math.round((missingImageCount/processedCount)*100)}%)`);
  console.log(`⚙️ Missing critical specs: ${missingSpecsCount} (${Math.round((missingSpecsCount/processedCount)*100)}%)`);
  
  // Add diagnostic guidance
  console.log('\n🔧 EXTRACTION DIAGNOSTIC GUIDANCE:');
  
  if (missingImageCount > processedCount * 0.2) {
    console.log('⚠️ HIGH RATE OF MISSING IMAGES DETECTED:');
    console.log('  - Check image URL extraction patterns');
    console.log('  - Verify that the data source contains image information');
    console.log('  - Review API response data structure for image fields');
  }
  
  if (missingSpecsCount > processedCount * 0.2) {
    console.log('⚠️ HIGH RATE OF MISSING SPECIFICATIONS DETECTED:');
    console.log('  - Review specification extraction patterns');
    console.log('  - Check title and description text for specification data');
    console.log('  - Consider enhancing fallback extraction methods');
  }
  
  console.log('\n--------------------------------------------------\n');
}

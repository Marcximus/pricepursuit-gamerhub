
/**
 * Calculate the average missing data percentage from multiple data points
 */
export const calculateAverageMissingPercentage = (
  processorPercentage: number,
  ramPercentage: number,
  storagePercentage: number,
  graphicsPercentage: number,
  screenSizePercentage: number
): number => {
  // Make sure all values are defined and valid numbers
  const validNumbers = [
    processorPercentage,
    ramPercentage,
    storagePercentage,
    graphicsPercentage,
    screenSizePercentage
  ].filter(x => typeof x === 'number' && !isNaN(x));
  
  // If no valid numbers, return 0
  if (validNumbers.length === 0) return 0;
  
  // Calculate the sum
  const sum = validNumbers.reduce((total, current) => total + current, 0);
  
  // Return the average as a rounded value for cleaner display
  return parseFloat((sum / validNumbers.length).toFixed(1));
};

/**
 * Log detailed statistics about missing data to help with debugging
 */
export const logMissingDataStats = (stats: any) => {
  console.log('=== DETAILED MISSING DATA ANALYSIS ===');
  console.log(`Total laptops in database: ${stats.totalLaptops}`);
  console.log('Missing data counts:');
  console.log(`- Prices: ${stats.missingInformation.prices.count}/${stats.totalLaptops} (${stats.missingInformation.prices.percentage}%)`);
  console.log(`- Processor: ${stats.missingInformation.processor.count}/${stats.totalLaptops} (${stats.missingInformation.processor.percentage}%)`);
  console.log(`- RAM: ${stats.missingInformation.ram.count}/${stats.totalLaptops} (${stats.missingInformation.ram.percentage}%)`);
  console.log(`- Storage: ${stats.missingInformation.storage.count}/${stats.totalLaptops} (${stats.missingInformation.storage.percentage}%)`);
  console.log(`- Graphics: ${stats.missingInformation.graphics.count}/${stats.totalLaptops} (${stats.missingInformation.graphics.percentage}%)`);
  console.log(`- Screen Size: ${stats.missingInformation.screenSize.count}/${stats.totalLaptops} (${stats.missingInformation.screenSize.percentage}%)`);
  
  console.log('Raw data from database queries:');
  console.log('- Query parameters and options should be checked for correctness');
  console.log('- Ensure database update operations are actually saving values to the correct fields');
  
  // Check database queries implementation
  console.log('\nDatabase query implementation check:');
  console.log('1. Check if getTotalLaptopCount is counting all laptops correctly');
  console.log('2. Check if getLaptopsWithProcessorCount and similar functions have correct filters');
  console.log('3. Verify that update-laptops edge function is extracting and saving specification data');
  console.log('4. Look for empty strings vs null values in specification fields');
}

/**
 * Check if a laptop has its specifications extracted
 * @param laptop The laptop object to check
 * @returns True if the laptop has specifications, false otherwise
 */
export const hasExtractedSpecifications = (laptop: any): boolean => {
  // Check if any of the key specifications are present
  return !!(
    laptop.processor || 
    laptop.ram || 
    laptop.storage || 
    laptop.graphics || 
    laptop.screen_size
  );
}

/**
 * Examine a laptop record to find potential issues with specification extraction
 * @param laptop The laptop object to examine
 * @returns An object containing diagnostics information
 */
export const diagnoseLaptopSpecIssues = (laptop: any) => {
  const issues = [];
  
  // Check if the title exists but specs are missing
  if (laptop.title && !hasExtractedSpecifications(laptop)) {
    issues.push('Title exists but specifications not extracted');
  }
  
  // Check if there was an update attempt
  if (laptop.last_checked && !hasExtractedSpecifications(laptop)) {
    issues.push('Laptop was checked but specifications not extracted');
  }
  
  // Check for empty strings instead of null values
  if (laptop.processor === '') issues.push('Empty processor string instead of null');
  if (laptop.ram === '') issues.push('Empty RAM string instead of null');
  if (laptop.storage === '') issues.push('Empty storage string instead of null');
  if (laptop.graphics === '') issues.push('Empty graphics string instead of null');
  if (laptop.screen_size === '') issues.push('Empty screen size string instead of null');
  
  // Check if update was completed but specs are missing
  if (laptop.update_status === 'completed' && !hasExtractedSpecifications(laptop)) {
    issues.push('Update marked as completed but specifications missing');
  }
  
  return {
    hasIssues: issues.length > 0,
    issues,
    recommendations: issues.length > 0 ? [
      'Check extraction logic in update-laptops edge function',
      'Verify that specification data is being saved to the database',
      'Review the product title for extractable specification information'
    ] : []
  };
}

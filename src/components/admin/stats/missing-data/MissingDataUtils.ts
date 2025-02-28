
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
  // Return the average as a rounded value for cleaner display
  return Math.round(
    (processorPercentage +
    ramPercentage +
    storagePercentage +
    graphicsPercentage +
    screenSizePercentage) / 5
  );
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
}

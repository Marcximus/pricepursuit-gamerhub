
import { insertOrUpdateProducts } from "./services/database/index.ts";
import { validateAndFilterProducts } from "./processors/productValidator.ts";
import { transformProductData } from "./processors/dataTransformer.ts";
import { createInitialStats, updateStatsFromDbResults, ProcessingStats } from "./processors/statsTracker.ts";

/**
 * Main function to process products from raw data to database insertion
 * @param products Raw product data array
 * @param brand Brand name
 * @param detailedLogging Whether to log detailed information
 * @returns Processing statistics
 */
export async function processProducts(
  products: any[], 
  brand: string, 
  detailedLogging = false
): Promise<ProcessingStats> {
  // Initialize stats
  const stats = createInitialStats();

  try {
    // Validate and filter products
    const laptopProducts = validateAndFilterProducts(products, brand, detailedLogging);
    
    if (laptopProducts.length === 0) {
      console.log(`No valid laptop products found for ${brand}`);
      return stats;
    }

    // Process each laptop product
    const processedProducts = laptopProducts.map(product => {
      const transformedProduct = transformProductData(product, brand);
      if (transformedProduct) {
        stats.processed++;
        return transformedProduct;
      } else {
        stats.failed++;
        return null;
      }
    }).filter(Boolean); // Remove null entries
    
    if (detailedLogging) {
      console.log(`Prepared ${processedProducts.length} product objects for database insertion/update`);
    }

    // Insert or update products in the database
    if (processedProducts.length > 0) {
      const dbResults = await insertOrUpdateProducts(processedProducts, detailedLogging);
      const updatedStats = updateStatsFromDbResults(stats, dbResults);
      
      console.log(`Database results for ${brand}: ${dbResults.added} added, ${dbResults.updated} updated, ${dbResults.failed} failed`);
      
      return updatedStats;
    }

    return stats;
  } catch (error) {
    console.error(`Error in processProducts for ${brand}:`, error);
    return {
      processed: stats.processed,
      updated: stats.updated,
      added: stats.added,
      failed: stats.failed + 1 // Increment failed count
    };
  }
}

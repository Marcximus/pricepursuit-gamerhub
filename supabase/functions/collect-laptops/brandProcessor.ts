
import { scrapeBrandData } from "./oxylabsService.ts";
import { processProducts } from "./productProcessor.ts";
import { saveProgress, updateBrandStatus } from "./progressService.ts";
import { CollectionStats, BrandProcessingResult } from "./types.ts";

/**
 * Process a single brand, collecting and processing all products for it
 * @param brand Brand name to process
 * @param groupIndex The current group index
 * @param brandIndex The current brand index within the group
 * @param totalStats The running statistics object to update
 * @param pagesPerBrand Number of pages to process for this brand
 * @param detailedLogging Whether to log detailed information
 * @returns Processing result
 */
export async function processBrand(
  brand: string, 
  groupIndex: number, 
  brandIndex: number, 
  totalStats: CollectionStats,
  pagesPerBrand: number,
  detailedLogging: boolean = false
): Promise<BrandProcessingResult> {
  try {
    // Update status to in_progress
    await updateBrandStatus(brand, 'in_progress');
    
    // Stats for this brand
    const brandStats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0,
      skipped: 0
    };
    
    // Process each page for this brand
    for (let page = 1; page <= pagesPerBrand; page++) {
      console.log(`Processing ${brand} page ${page}...`);
      
      try {
        // Scrape product data for this brand and page
        const laptops = await scrapeBrandData(brand, page);
        
        // Validate the laptops data
        if (!laptops || !Array.isArray(laptops) || laptops.length === 0) {
          console.warn(`No laptops found for ${brand} page ${page}, skipping...`);
          continue;
        }
        
        // Process the products
        const pageResult = await processProducts(laptops, brand, detailedLogging);
        
        // Update brand stats
        brandStats.processed += pageResult.processed;
        brandStats.updated += pageResult.updated;
        brandStats.added += pageResult.added;
        brandStats.failed += pageResult.failed;
        
        console.log(`Page ${page} results:`, pageResult);
      } catch (pageError) {
        console.error(`Error processing page ${page} for ${brand}:`, pageError);
        brandStats.failed += 1;
      }
    }

    // Update the brand status to completed
    await updateBrandStatus(brand, 'completed');
    
    // Update total stats
    totalStats.processed += brandStats.processed;
    totalStats.updated += brandStats.updated;
    totalStats.added += brandStats.added;
    totalStats.failed += brandStats.failed;
    totalStats.skipped = (totalStats.skipped || 0) + (brandStats.skipped || 0);
    
    console.log(`Completed brand ${brand} with stats:`, brandStats);
    console.log(`Running totals:`, totalStats);
    
    // Save our progress after the brand is processed
    await saveProgress(groupIndex, brandIndex + 1, totalStats);
    
    return { brand, stats: brandStats };
  } catch (error) {
    console.error(`Error processing brand ${brand}:`, error);
    
    // Set the brand back to pending if it failed
    try {
      await updateBrandStatus(brand, 'pending');
    } catch (resetError) {
      console.error(`Failed to reset brand status for ${brand}:`, resetError);
    }
    
    // Still save progress even on failure
    await saveProgress(groupIndex, brandIndex + 1, totalStats);
    
    throw error;
  }
}

/**
 * Create batches of brands for parallel processing
 * @param brands Array of brand names
 * @param batchSize Number of brands to process in parallel
 * @returns Array of brand batches
 */
export function createBrandBatches(brands: string[], batchSize: number = 5): string[][] {
  const batches: string[][] = [];
  
  for (let i = 0; i < brands.length; i += batchSize) {
    batches.push(brands.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Process all brands in batches
 * @param brands List of brands to process
 * @param pagesPerBrand Number of pages to process per brand
 * @param startGroupIndex Starting group index for resuming
 * @param startBrandIndex Starting brand index for resuming
 * @param resumeStats Stats from previous run for resuming
 * @param detailedLogging Whether to log detailed information
 * @returns Collection statistics
 */
export async function processAllBrands(
  brands: string[], 
  pagesPerBrand: number, 
  startGroupIndex = 0, 
  startBrandIndex = 0, 
  resumeStats: CollectionStats = { processed: 0, updated: 0, added: 0, failed: 0, skipped: 0 }, 
  detailedLogging = false
): Promise<CollectionStats> {
  console.log(`Starting processAllBrands with ${brands.length} brands, pagesPerBrand=${pagesPerBrand}, startGroupIndex=${startGroupIndex}, startBrandIndex=${startBrandIndex}`);
  console.log(`Resuming with previous stats:`, resumeStats);

  if (!brands || !Array.isArray(brands)) {
    console.error("Invalid brands array:", brands);
    throw new Error("Invalid brands array provided");
  }

  // Create batches of brands for processing
  const brandBatches = createBrandBatches(brands);

  // Initialize statistics object
  const stats: CollectionStats = {
    processed: resumeStats.processed || 0,
    updated: resumeStats.updated || 0,
    added: resumeStats.added || 0,
    failed: resumeStats.failed || 0,
    skipped: resumeStats.skipped || 0
  };

  // Process brands in batches
  for (let groupIndex = startGroupIndex; groupIndex < brandBatches.length; groupIndex++) {
    const group = brandBatches[groupIndex];
    
    // Skip to the starting brand index only for the first group we process
    const startIdx = groupIndex === startGroupIndex ? startBrandIndex : 0;
    
    for (let brandIndex = startIdx; brandIndex < group.length; brandIndex++) {
      const brand = group[brandIndex];
      console.log(`Processing brand ${brandIndex + 1}/${group.length} in group ${groupIndex + 1}/${brandBatches.length}: ${brand}`);

      try {
        await processBrand(brand, groupIndex, brandIndex, stats, pagesPerBrand, detailedLogging);
      } catch (brandError) {
        console.error(`Error processing brand ${brand}:`, brandError);
        stats.failed += 1;
        
        // Progress is saved inside processBrand, even on error
      }
    }
  }

  // Mark collection as complete by saving null progress data
  await saveProgress(0, 0, stats, true);
  
  console.log(`Collection process complete. Final stats:`, stats);
  return stats;
}

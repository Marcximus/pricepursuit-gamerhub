
import { supabase } from "@/integrations/supabase/client";
import { COLLECTION_CONFIG } from "./config";
import { CollectionStats } from "./types";
import { updateBrandStatus, processPage } from "./collection/statusManagement";
import { preserveExistingData } from "./update/processUpdateResponse";

/**
 * Create batches of brands for parallel processing
 * @param brands Array of brand names
 * @param batchSize Number of brands to process in parallel
 * @returns Array of brand batch arrays
 */
export function createBrandBatches(brands: string[], batchSize: number) {
  const batches: string[][] = [];
  
  for (let i = 0; i < brands.length; i += batchSize) {
    batches.push(brands.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Process a brand by collecting data for multiple pages
 * @param brand Brand name to process
 * @param groupIndex The current group index
 * @param brandIndex The current brand index within the group
 * @param totalStats The running statistics object to update
 * @param preserveExistingData Whether to preserve existing data for already present ASINs
 * @returns Processing result
 */
export async function processBrand(
  brand: string, 
  groupIndex: number, 
  brandIndex: number, 
  totalStats: CollectionStats,
  preserveExistingDataFlag: boolean = true
) {
  try {
    // Update status to in_progress
    await updateBrandStatus(brand, 'in_progress');
    
    // Process each page for this brand
    const totalBrands = COLLECTION_CONFIG.LAPTOP_BRANDS.length;
    const brandStats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0,
      skipped: 0
    };
    
    for (let page = 1; page <= COLLECTION_CONFIG.PAGES_PER_BRAND; page++) {
      const pageResult = await processPage(brand, page, groupIndex, brandIndex, totalBrands, preserveExistingDataFlag);
      
      if (pageResult && pageResult.stats) {
        // Update brand stats
        brandStats.processed += pageResult.stats.processed || 0;
        brandStats.updated += pageResult.stats.updated || 0;
        brandStats.added += pageResult.stats.added || 0;
        brandStats.failed += pageResult.stats.failed || 0;
        brandStats.skipped = (brandStats.skipped || 0) + (pageResult.stats.skipped || 0);
        
        // Update total stats
        totalStats.processed += pageResult.stats.processed || 0;
        totalStats.updated += pageResult.stats.updated || 0;
        totalStats.added += pageResult.stats.added || 0;
        totalStats.failed += pageResult.stats.failed || 0;
        totalStats.skipped = (totalStats.skipped || 0) + (pageResult.stats.skipped || 0);
      }
    }
    
    console.log(`Brand ${brand} processing completed with stats:`, brandStats);
    
    // Update status to completed
    await updateBrandStatus(brand, 'completed');
    
    return { brand, stats: brandStats };
  } catch (error) {
    console.error(`Error processing brand ${brand}:`, error);
    
    // Reset status back to pending
    await updateBrandStatus(brand, 'pending');
    
    throw error;
  }
}

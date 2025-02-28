
import { toast } from "@/components/ui/use-toast";
import { COLLECTION_CONFIG } from "../config";
import { CollectionStats } from "../types";
import { processPage, updateBrandStatus } from "./statusManagement";

/**
 * Creates batches of brands for parallel processing
 */
export function createBrandBatches(brands: string[], batchSize: number) {
  const batches = [];
  for (let i = 0; i < brands.length; i += batchSize) {
    batches.push(brands.slice(i, Math.min(i + batchSize, brands.length)));
  }
  return batches;
}

/**
 * Processes a single brand, updating its status and collecting data for all its pages
 */
export async function processBrand(
  brand: string,
  groupIndex: number,
  brandIndex: number,
  totalStats: CollectionStats
): Promise<any> {
  console.log(`Starting to process brand: ${brand} (group ${groupIndex}, index ${brandIndex})`);
  
  try {
    // Mark brand as in progress
    await updateBrandStatus(brand, 'in_progress');
    
    // Track per-brand stats for this run
    const brandStats: CollectionStats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0,
      skipped: 0
    };
    
    // Process each page for this brand
    for (let page = 1; page <= COLLECTION_CONFIG.PAGES_PER_BRAND; page++) {
      console.log(`Processing ${brand} page ${page}/${COLLECTION_CONFIG.PAGES_PER_BRAND}`);
      
      try {
        // Updated to match the new signature - brand first, then pageNumber
        const response = await processPage(brand, page, groupIndex, brandIndex, COLLECTION_CONFIG.LAPTOP_BRANDS.length);
        
        if (response?.stats) {
          // Update brand-specific stats
          brandStats.processed += response.stats.processed || 0;
          brandStats.updated += response.stats.updated || 0;
          brandStats.added += response.stats.added || 0;
          brandStats.failed += response.stats.failed || 0;
          brandStats.skipped = (brandStats.skipped || 0) + (response.stats.skipped || 0);
          
          // Update total stats
          updateTotalStats(totalStats, response.stats);
          
          showProgressToast(brand, page, response.stats);
        } else {
          console.warn(`No stats returned for ${brand} page ${page}`);
          brandStats.failed++;
          totalStats.failed++;
        }
      } catch (pageError) {
        console.error(`Error processing ${brand} page ${page}:`, pageError);
        brandStats.failed++;
        totalStats.failed++;
      }

      // Add a small delay between pages to avoid rate limiting
      if (page < COLLECTION_CONFIG.PAGES_PER_BRAND) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Mark brand as completed when all pages are processed
    await updateBrandStatus(brand, 'completed');
    
    console.log(`Successfully processed all pages for ${brand}. Brand stats:`, brandStats);
    return { success: true, brand, stats: brandStats };
    
  } catch (error) {
    console.error(`Error processing ${brand}:`, error);
    
    // Reset brand status on error
    try {
      await updateBrandStatus(brand, 'pending');
    } catch (statusError) {
      console.error(`Failed to reset status for ${brand}:`, statusError);
    }
    
    toast({
      title: "Brand Failed",
      description: `Failed to collect data for ${brand}: ${error.message}`,
      variant: "destructive"
    });
    
    throw error;
  }
}

/**
 * Updates the total collection stats with page-specific stats
 */
function updateTotalStats(totalStats: CollectionStats, pageStats: CollectionStats) {
  totalStats.processed += pageStats.processed || 0;
  totalStats.updated += pageStats.updated || 0;
  totalStats.added += pageStats.added || 0;
  totalStats.failed += pageStats.failed || 0;
  totalStats.skipped = (totalStats.skipped || 0) + (pageStats.skipped || 0);
}

/**
 * Displays a toast notification with the progress of page processing
 */
function showProgressToast(brand: string, page: number, stats: CollectionStats) {
  const skippedMsg = stats.skipped ? `, ${stats.skipped} skipped` : '';
  
  toast({
    title: "Collection Progress",
    description: `Page ${page}/${COLLECTION_CONFIG.PAGES_PER_BRAND} for ${brand}:
      ${stats.processed} processed,
      ${stats.added} new,
      ${stats.updated} updated${skippedMsg}`,
    variant: "default"
  });
}


import { toast } from "@/components/ui/use-toast";
import { COLLECTION_CONFIG } from "./config";
import { CollectionStats } from "./types";
import { processPage, updateBrandStatus } from "./collectionDb";

export function createBrandBatches(brands: string[], batchSize: number) {
  const batches = [];
  for (let i = 0; i < brands.length; i += batchSize) {
    batches.push(brands.slice(i, Math.min(i + batchSize, brands.length)));
  }
  return batches;
}

export async function processBrand(
  brand: string,
  groupIndex: number,
  brandIndex: number,
  totalStats: CollectionStats
) {
  try {
    for (let page = 1; page <= COLLECTION_CONFIG.PAGES_PER_BRAND; page++) {
      console.log(`Processing ${brand} page ${page}/${COLLECTION_CONFIG.PAGES_PER_BRAND}`);
      
      const response = await processPage(brand, page, groupIndex, brandIndex, COLLECTION_CONFIG.LAPTOP_BRANDS.length);
      
      if (response?.stats) {
        updateTotalStats(totalStats, response.stats);
        showProgressToast(brand, page, response.stats);
      }

      if (page < COLLECTION_CONFIG.PAGES_PER_BRAND) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await updateBrandStatus(brand, 'completed');
    console.log(`Successfully processed all pages for ${brand}`);
    
  } catch (error) {
    console.error(`Error processing ${brand}:`, error);
    await updateBrandStatus(brand, 'pending');
    
    toast({
      title: "Brand Failed",
      description: `Failed to collect data for ${brand}: ${error.message}`,
      variant: "destructive"
    });
  }
}

function updateTotalStats(totalStats: CollectionStats, pageStats: CollectionStats) {
  totalStats.processed += pageStats.processed || 0;
  totalStats.updated += pageStats.updated || 0;
  totalStats.added += pageStats.added || 0;
  totalStats.failed += pageStats.failed || 0;
}

function showProgressToast(brand: string, page: number, stats: CollectionStats) {
  toast({
    title: "Collection Progress",
    description: `Page ${page}/${COLLECTION_CONFIG.PAGES_PER_BRAND} for ${brand}:
      ${stats.processed} processed,
      ${stats.added} new,
      ${stats.updated} updated`,
    variant: "default"
  });
}

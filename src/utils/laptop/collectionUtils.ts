
import { toast } from "@/components/ui/use-toast";
import { COLLECTION_CONFIG } from "./config";
import { CollectionStats } from "./types";
import { processPage, updateBrandStatus } from "./collectionDb";
import { containsForbiddenKeywords } from "./productFilters";
import { 
  normalizeProcessor, 
  normalizeRam, 
  normalizeStorage, 
  normalizeGraphics, 
  normalizeScreenSize 
} from "./normalizers";

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

function updateTotalStats(totalStats: CollectionStats, pageStats: CollectionStats) {
  totalStats.processed += pageStats.processed || 0;
  totalStats.updated += pageStats.updated || 0;
  totalStats.added += pageStats.added || 0;
  totalStats.failed += pageStats.failed || 0;
  totalStats.skipped = (totalStats.skipped || 0) + (pageStats.skipped || 0);
}

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

/**
 * Check if a product should be collected based on filtering rules
 * @param title Product title
 * @returns True if the product should be collected, false if it should be skipped
 */
export function shouldCollectProduct(title: string): boolean {
  // Skip products with forbidden keywords in the title
  return !containsForbiddenKeywords(title);
}

/**
 * Ensure all laptop specifications are properly extracted and normalized
 * before saving to the database
 */
export function normalizeProductSpecs(product: any): any {
  const updatedProduct = { ...product };
  
  // Normalize processor
  if (product.processor) {
    updatedProduct.processor = normalizeProcessor(product.processor);
  }
  
  // Normalize RAM
  if (product.ram) {
    updatedProduct.ram = normalizeRam(product.ram);
  }
  
  // Normalize storage
  if (product.storage) {
    updatedProduct.storage = normalizeStorage(product.storage);
  }
  
  // Normalize graphics
  if (product.graphics) {
    updatedProduct.graphics = normalizeGraphics(product.graphics);
  }
  
  // Normalize screen size
  if (product.screen_size) {
    updatedProduct.screen_size = normalizeScreenSize(product.screen_size);
  }
  
  // Extract specs from title if they're missing
  if (!updatedProduct.processor && product.title) {
    const processedTitle = product.title;
    // Try to extract processor from title using common patterns
    const processorPatterns = [
      /\b(?:Intel Core i[3579]|AMD Ryzen [3579]|Intel Celeron|Apple M[123])\s*(?:[A-Z0-9-]+(?:\s*[A-Z0-9]+)*)\b/i,
      /\b(?:i[3579]-\d{4,5}[A-Z]*|Ryzen\s*\d\s*\d{4}[A-Z]*)\b/i,
    ];
    
    for (const pattern of processorPatterns) {
      const match = processedTitle.match(pattern);
      if (match) {
        updatedProduct.processor = normalizeProcessor(match[0]);
        break;
      }
    }
  }
  
  // Try to extract RAM if missing
  if (!updatedProduct.ram && product.title) {
    const ramPattern = /\b(\d+)\s*GB\s*(?:DDR[45]|LPDDR[45])?\s*(?:RAM|Memory)\b/i;
    const match = product.title.match(ramPattern);
    if (match) {
      updatedProduct.ram = normalizeRam(`${match[1]} GB`);
    }
  }
  
  // Try to extract storage if missing
  if (!updatedProduct.storage && product.title) {
    const storagePattern = /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|Storage)\b/i;
    const match = product.title.match(storagePattern);
    if (match) {
      updatedProduct.storage = normalizeStorage(match[0]);
    }
  }
  
  // Try to extract screen size if missing
  if (!updatedProduct.screen_size && product.title) {
    const screenPattern = /\b(1[0-9](?:\.[0-9])?)"?\s*(?:inch|"|inches|display|screen|laptop)\b/i;
    const match = product.title.match(screenPattern);
    if (match) {
      updatedProduct.screen_size = normalizeScreenSize(`${match[1]}"`);
    }
  }
  
  // Try to extract graphics if missing
  if (!updatedProduct.graphics && product.title) {
    const graphicsPatterns = [
      /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s*\d{3,4}(?:\s*Ti)?\b/i,
      /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*\d{3,4}[A-Z]*\b/i,
      /\b(?:Intel\s+)?(?:UHD|Iris\s+Xe|Iris\s+Plus|HD)\s*Graphics\b/i,
    ];
    
    for (const pattern of graphicsPatterns) {
      const match = product.title.match(pattern);
      if (match) {
        updatedProduct.graphics = normalizeGraphics(match[0]);
        break;
      }
    }
  }
  
  return updatedProduct;
}

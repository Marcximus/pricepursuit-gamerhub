
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { COLLECTION_CONFIG } from "./config";
import { CollectionStats } from "./types";
import { resetStaleCollections, checkActiveCollections } from "./collectionDb";
import { createBrandBatches, processBrand } from "./collectionUtils";

export async function collectLaptops() {
  console.log('collectLaptops function called');
  
  const totalStats: CollectionStats = {
    processed: 0,
    updated: 0,
    added: 0,
    failed: 0
  };
  
  try {
    console.log('Checking collection status...');

    const staleTimeout = new Date(Date.now() - COLLECTION_CONFIG.STALE_COLLECTION_MINUTES * 60 * 1000).toISOString();
    
    await resetStaleCollections(staleTimeout);
    const activeCollections = await checkActiveCollections(staleTimeout);

    if (activeCollections && activeCollections.length > 0) {
      const timeElapsed = Math.round((new Date().getTime() - new Date(activeCollections[0].last_collection_attempt).getTime()) / 1000);
      console.log(`Collection in progress, started ${timeElapsed} seconds ago`);
      
      toast({
        title: "Collection already in progress",
        description: `A collection is already running (started ${Math.round(timeElapsed / 60)} minutes ago). Please wait for it to complete.`,
        variant: "default"
      });
      return null;
    }

    const brandBatches = createBrandBatches(COLLECTION_CONFIG.LAPTOP_BRANDS, COLLECTION_CONFIG.PARALLEL_BATCHES);
    console.log(`Processing ${brandBatches.length} batch groups with ${COLLECTION_CONFIG.PARALLEL_BATCHES} brands per group`);

    toast({
      title: "Collection Started",
      description: `Starting collection for ${COLLECTION_CONFIG.LAPTOP_BRANDS.length} brands in ${brandBatches.length} batches`,
      variant: "default"
    });

    for (const [groupIndex, batchGroup] of brandBatches.entries()) {
      console.log(`Processing batch group ${groupIndex + 1}/${brandBatches.length}`);

      const processBrandPromises = batchGroup.map((brand, brandIndex) => 
        processBrand(brand, groupIndex, brandIndex, totalStats)
      );

      await Promise.all(processBrandPromises);

      if (groupIndex < brandBatches.length - 1) {
        console.log(`Waiting ${COLLECTION_CONFIG.DELAY_BETWEEN_BATCHES}ms before processing next batch group...`);
        await new Promise(resolve => setTimeout(resolve, COLLECTION_CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }

    console.log('Collection process completed. Final statistics:', totalStats);
    
    toast({
      title: "Collection Complete",
      description: `Processed ${totalStats.processed} laptops:
        ${totalStats.added} new,
        ${totalStats.updated} updated,
        ${totalStats.failed} failed`,
      variant: "default"
    });
    
    return { 
      batches: brandBatches.length,
      stats: totalStats
    };

  } catch (error) {
    console.error('Error in collectLaptops:', error);
    
    await supabase
      .from('products')
      .update({ collection_status: 'pending' })
      .eq('collection_status', 'in_progress');
      
    toast({
      title: "Collection failed",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
}

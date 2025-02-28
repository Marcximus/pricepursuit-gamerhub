
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { COLLECTION_CONFIG } from "./config";
import { CollectionStats, CollectionProgressData } from "./types";
import { 
  resetStaleCollections, 
  checkActiveCollections, 
  saveCollectionProgress, 
  getLastCollectionProgress 
} from "./collection/statusManagement";
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

    // Get saved progress from the last interrupted collection
    const savedProgress = await getLastCollectionProgress();
    let startGroupIndex = 0;
    let startBrandIndexInGroup = 0;
    
    const brandBatches = createBrandBatches(COLLECTION_CONFIG.LAPTOP_BRANDS, COLLECTION_CONFIG.PARALLEL_BATCHES);
    console.log(`Processing ${brandBatches.length} batch groups with ${COLLECTION_CONFIG.PARALLEL_BATCHES} brands per group`);

    // If we have saved progress, use it to resume collection
    if (savedProgress && savedProgress.progress_data) {
      try {
        const progressData = savedProgress.progress_data as unknown as CollectionProgressData;
        
        if (progressData && 
            typeof progressData.groupIndex === 'number' && 
            typeof progressData.brandIndex === 'number' && 
            progressData.timestamp) {
          
          const progressTimestamp = new Date(progressData.timestamp);
          const hoursSinceLastProgress = (new Date().getTime() - progressTimestamp.getTime()) / (1000 * 60 * 60);
          
          // Only resume if the saved progress is recent (less than 24 hours old)
          if (hoursSinceLastProgress < 24) {
            startGroupIndex = progressData.groupIndex;
            startBrandIndexInGroup = progressData.brandIndex + 1; // Start from the next brand
            
            // If we're at the end of a group, move to the next group
            if (startBrandIndexInGroup >= brandBatches[startGroupIndex].length) {
              startGroupIndex++;
              startBrandIndexInGroup = 0;
            }
            
            // If we have valid resume data, log it and inform the user
            if (startGroupIndex < brandBatches.length) {
              console.log(`Resuming collection from group ${startGroupIndex + 1}/${brandBatches.length}, brand index ${startBrandIndexInGroup}`);
              
              // Add the stats from the previous run if available
              if (progressData.stats) {
                totalStats.processed += progressData.stats.processed || 0;
                totalStats.updated += progressData.stats.updated || 0;
                totalStats.added += progressData.stats.added || 0;
                totalStats.failed += progressData.stats.failed || 0;
                totalStats.skipped = (totalStats.skipped || 0) + (progressData.stats.skipped || 0);
                
                console.log(`Restored previous collection stats:`, totalStats);
              }
              
              toast({
                title: "Resuming Collection",
                description: `Resuming collection from previous progress (${Math.round(hoursSinceLastProgress * 10) / 10} hours ago)`,
                variant: "default"
              });
            }
          } else {
            console.log(`Saved progress is too old (${Math.round(hoursSinceLastProgress)} hours), starting fresh collection`);
          }
        }
      } catch (progressError) {
        console.error('Error parsing saved progress data:', progressError);
        // If there's an error parsing the saved progress, start from the beginning
      }
    }

    if (startGroupIndex === 0 && startBrandIndexInGroup === 0) {
      toast({
        title: "Collection Started",
        description: `Starting collection for ${COLLECTION_CONFIG.LAPTOP_BRANDS.length} brands in ${brandBatches.length} batches`,
        variant: "default"
      });
    }

    // Process each batch group
    for (let groupIndex = startGroupIndex; groupIndex < brandBatches.length; groupIndex++) {
      const batchGroup = brandBatches[groupIndex];
      console.log(`Processing batch group ${groupIndex + 1}/${brandBatches.length}`);
      
      // Process brands in parallel within the group, starting from the saved index
      const startIndex = groupIndex === startGroupIndex ? startBrandIndexInGroup : 0;
      
      for (let brandIndex = startIndex; brandIndex < batchGroup.length; brandIndex++) {
        const brand = batchGroup[brandIndex];
        console.log(`Processing brand ${brand} (group ${groupIndex + 1}, index ${brandIndex})`);
        
        // Process this brand
        try {
          const brandResult = await processBrand(brand, groupIndex, brandIndex, totalStats);
          
          // Save progress after each brand is processed
          await saveCollectionProgress(groupIndex, brandIndex, totalStats);
          
        } catch (brandError) {
          console.error(`Error processing brand ${brand}:`, brandError);
          // Save progress even if there's an error
          await saveCollectionProgress(groupIndex, brandIndex, totalStats);
          continue;
        }
      }

      if (groupIndex < brandBatches.length - 1) {
        console.log(`Waiting ${COLLECTION_CONFIG.DELAY_BETWEEN_BATCHES}ms before processing next batch group...`);
        await new Promise(resolve => setTimeout(resolve, COLLECTION_CONFIG.DELAY_BETWEEN_BATCHES));
      }
    }

    console.log('Collection process completed. Final statistics:', totalStats);
    
    // Clear the progress data when collection completes successfully
    await saveCollectionProgress(-1, -1, totalStats, true);
    
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

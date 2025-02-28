
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { COLLECTION_CONFIG } from "./config";
import { CollectionStats, CollectionProgressData } from "./types";
import { 
  resetStaleCollections, 
  checkActiveCollections, 
  saveCollectionProgress, 
  getLastCollectionProgress 
} from "./collection/status";
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

    // Set stale timeout to 30 seconds instead of using minutes from config
    const staleTimeout = new Date(Date.now() - 30 * 1000).toISOString();
    console.log('Stale timeout set to:', staleTimeout);
    
    // Reset any stale collections (in case a previous collection was interrupted)
    console.log('Resetting stale collections...');
    await resetStaleCollections(staleTimeout);
    console.log('Stale collections reset complete');
    
    // Check if there's already a collection in progress
    console.log('Checking for active collections...');
    const activeCollections = await checkActiveCollections(staleTimeout);
    console.log('Active collections check result:', activeCollections);

    if (activeCollections && activeCollections.length > 0) {
      const timeElapsed = Math.round((new Date().getTime() - new Date(activeCollections[0].last_collection_attempt).getTime()) / 1000);
      console.log(`Collection in progress, started ${timeElapsed} seconds ago`);
      
      toast({
        title: "Collection already in progress",
        description: `A collection is already running (started ${timeElapsed} seconds ago). Please wait for it to complete or try again in ${Math.max(0, 30 - timeElapsed)} seconds.`,
        variant: "default"
      });
      return null;
    }

    // Check if there's a previously saved progress
    console.log('Checking for previous collection progress...');
    const lastProgress = await getLastCollectionProgress();
    console.log('Last collection progress:', lastProgress);

    // Determine starting point (resume or fresh start)
    let startGroupIndex = 0;
    let startBrandIndex = 0;
    let resumeStats = {
      processed: 0,
      updated: 0,
      added: 0,
      failed: 0,
      skipped: 0
    };

    if (lastProgress && lastProgress.progress_data) {
      // Resume from where we left off
      const progressData = lastProgress.progress_data as any;
      startGroupIndex = progressData.groupIndex || 0;
      startBrandIndex = progressData.brandIndex || 0;

      // Add the stats from the previous run
      if (progressData.stats) {
        resumeStats = progressData.stats;
        totalStats.processed = resumeStats.processed || 0;
        totalStats.updated = resumeStats.updated || 0;
        totalStats.added = resumeStats.added || 0;
        totalStats.failed = resumeStats.failed || 0;
        totalStats.skipped = resumeStats.skipped || 0;
      }

      console.log(`Resuming collection from group ${startGroupIndex}, brand ${startBrandIndex}`);
      console.log('Resuming with previous stats:', resumeStats);
      
      toast({
        title: "Resuming Collection",
        description: `Resuming collection from where it left off (group ${startGroupIndex + 1}, brand ${startBrandIndex + 1}).`,
        variant: "default"
      });
    } else {
      console.log('Starting fresh collection');
      
      // We're starting fresh, so we need to save an initial progress record
      await saveCollectionProgress(0, 0, totalStats, false);
    }

    console.log('Preparing to invoke collect-laptops edge function...');
    console.log('Edge function parameters:', { 
      brands: COLLECTION_CONFIG.LAPTOP_BRANDS,
      pagesPerBrand: COLLECTION_CONFIG.PAGES_PER_BRAND,
      startGroupIndex,
      startBrandIndex,
      resumeStats
    });
    
    // Call the Supabase Edge Function with proper parameters
    console.log('Invoking collect-laptops edge function...');
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      method: 'POST',
      body: { 
        brands: COLLECTION_CONFIG.LAPTOP_BRANDS,
        pagesPerBrand: COLLECTION_CONFIG.PAGES_PER_BRAND,
        detailedLogging: true, // Add flag to enable detailed logging on the server
        startGroupIndex, // Send the starting group index
        startBrandIndex, // Send the starting brand index
        resumeStats // Send the resume stats
      }
    });
    
    if (error) {
      console.error('Error invoking collect-laptops function:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        context: error.context,
        details: error.details
      });
      throw error;
    }
    
    console.log('Edge function response received:', data);
    
    toast({
      title: startGroupIndex > 0 || startBrandIndex > 0 ? "Collection Resumed" : "Collection Started",
      description: `${startGroupIndex > 0 || startBrandIndex > 0 ? 'Resumed' : 'Started'} collection for ${COLLECTION_CONFIG.LAPTOP_BRANDS.length} brands. This may take some time to complete. Check the console logs for detailed progress.`,
      variant: "default"
    });
    
    // Return a response based on the edge function result
    console.log('Collection process initiated successfully');
    return { 
      success: true,
      batches: Math.ceil(COLLECTION_CONFIG.LAPTOP_BRANDS.length / COLLECTION_CONFIG.PARALLEL_BATCHES),
      stats: data?.stats || {
        processed: 0,
        updated: 0,
        added: 0,
        failed: 0
      },
      resumed: startGroupIndex > 0 || startBrandIndex > 0
    };

  } catch (error) {
    console.error('Error in collectLaptops:', error);
    console.error('Error stack:', error.stack);
    
    // Attempt to reset any in-progress statuses in case of error
    try {
      console.log('Attempting to reset collection statuses after error...');
      await supabase
        .from('products')
        .update({ collection_status: 'pending' })
        .eq('collection_status', 'in_progress');
      console.log('Reset collection statuses complete');
    } catch (resetError) {
      console.error('Error resetting collection statuses:', resetError);
    }
      
    toast({
      title: "Collection failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
}

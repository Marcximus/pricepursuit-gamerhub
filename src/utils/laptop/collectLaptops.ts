
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
    
    // Reset any stale collections (in case a previous collection was interrupted)
    await resetStaleCollections(staleTimeout);
    
    // Check if there's already a collection in progress
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

    console.log('Invoking collect-laptops edge function...');
    
    // Call the Supabase Edge Function with proper parameters
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      method: 'POST',
      body: { 
        brands: COLLECTION_CONFIG.LAPTOP_BRANDS,
        pagesPerBrand: COLLECTION_CONFIG.PAGES_PER_BRAND
      }
    });
    
    if (error) {
      console.error('Error invoking collect-laptops function:', error);
      throw error;
    }
    
    console.log('Edge function response:', data);
    
    toast({
      title: "Collection Started",
      description: `Started collection for ${COLLECTION_CONFIG.LAPTOP_BRANDS.length} brands. This may take some time to complete.`,
      variant: "default"
    });
    
    // Return a response based on the edge function result
    return { 
      success: true,
      batches: Math.ceil(COLLECTION_CONFIG.LAPTOP_BRANDS.length / COLLECTION_CONFIG.PARALLEL_BATCHES),
      stats: data?.stats || {
        processed: 0,
        updated: 0,
        added: 0,
        failed: 0
      }
    };

  } catch (error) {
    console.error('Error in collectLaptops:', error);
    
    // Attempt to reset any in-progress statuses in case of error
    try {
      await supabase
        .from('products')
        .update({ collection_status: 'pending' })
        .eq('collection_status', 'in_progress');
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

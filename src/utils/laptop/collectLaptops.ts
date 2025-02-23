
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const PARALLEL_BATCHES = 3;
const DELAY_BETWEEN_BATCHES = 3000;
const PAGES_PER_BRAND = 5;
const STALE_COLLECTION_MINUTES = 30;

export async function collectLaptops() {
  console.log('collectLaptops function called');
  
  try {
    console.log('Checking collection status...');

    // Reset any stale collection statuses
    const staleTimeout = new Date(Date.now() - STALE_COLLECTION_MINUTES * 60 * 1000).toISOString();
    const { error: cleanupError } = await supabase
      .from('products')
      .update({ collection_status: 'pending' })
      .eq('collection_status', 'in_progress')
      .lt('last_collection_attempt', staleTimeout);

    if (cleanupError) {
      console.error('Error cleaning up stale statuses:', cleanupError);
      throw cleanupError;
    }

    // Check for active collections
    const { data: activeCollections, error: statusError } = await supabase
      .from('products')
      .select('collection_status, last_collection_attempt')
      .eq('collection_status', 'in_progress')
      .gt('last_collection_attempt', staleTimeout)
      .limit(1);

    if (statusError) {
      console.error('Status check error:', statusError);
      throw statusError;
    }

    if (activeCollections && activeCollections.length > 0) {
      const timeElapsed = Math.round((new Date().getTime() - new Date(activeCollections[0].last_collection_attempt).getTime()) / 1000);
      console.log(`Collection in progress, started ${timeElapsed} seconds ago`);
      
      toast({
        title: "Collection already in progress",
        description: `A collection is already running (started ${Math.round(timeElapsed / 60)} minutes ago). Please wait for it to complete or try again in a few minutes.`,
        variant: "default"
      });
      return null;
    }

    // Create parallel batch groups
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += PARALLEL_BATCHES) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, Math.min(i + PARALLEL_BATCHES, LAPTOP_BRANDS.length)));
    }

    console.log(`Processing ${brandBatches.length} batch groups with ${PARALLEL_BATCHES} brands per group`);

    // Show initial toast
    toast({
      title: "Collection Started",
      description: `Starting collection for ${LAPTOP_BRANDS.length} brands in ${brandBatches.length} batches. This may take a while.`,
      variant: "default"
    });

    // Process each batch group
    for (const [groupIndex, batchGroup] of brandBatches.entries()) {
      console.log(`Processing batch group ${groupIndex + 1}/${brandBatches.length}`);

      // Mark brands as in progress
      for (const brand of batchGroup) {
        await supabase
          .from('products')
          .update({ 
            collection_status: 'in_progress',
            last_collection_attempt: new Date().toISOString()
          })
          .eq('brand', brand);
      }

      // Process brands in parallel within the group
      const processBrandPromises = batchGroup.map(async (brand, brandIndex) => {
        console.log(`Starting collection for ${brand} (${brandIndex + 1}/${batchGroup.length})`);
        
        try {
          // Process one page at a time to avoid timeouts
          for (let page = 1; page <= PAGES_PER_BRAND; page++) {
            console.log(`Processing ${brand} page ${page}/${PAGES_PER_BRAND}`);
            
            const { error: functionError } = await supabase.functions.invoke('collect-laptops', {
              body: {
                brands: [brand],
                pages_per_brand: 1,
                current_page: page,
                batch_number: groupIndex * PARALLEL_BATCHES + brandIndex + 1,
                total_batches: LAPTOP_BRANDS.length
              }
            });

            if (functionError) {
              console.error(`Edge function error for ${brand} page ${page}:`, functionError);
              continue;
            }

            // Add small delay between pages
            if (page < PAGES_PER_BRAND) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          // Update status to completed after all pages are processed
          await supabase
            .from('products')
            .update({ collection_status: 'completed' })
            .eq('brand', brand);

          console.log(`Successfully processed all pages for ${brand}`);
          
          toast({
            title: "Brand Completed",
            description: `Finished collecting data for ${brand}`,
            variant: "default"
          });
        } catch (brandError) {
          console.error(`Error processing ${brand}:`, brandError);
          
          // Reset status for failed brand
          await supabase
            .from('products')
            .update({ collection_status: 'pending' })
            .eq('brand', brand);
            
          toast({
            title: "Brand Failed",
            description: `Failed to collect data for ${brand}: ${brandError.message}`,
            variant: "destructive"
          });
        }
      });

      // Wait for all brands in the current group to complete
      await Promise.all(processBrandPromises);

      // Add delay before processing next batch group
      if (groupIndex < brandBatches.length - 1) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before processing next batch group...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    console.log('Collection process completed successfully');
    
    toast({
      title: "Collection Complete",
      description: `Successfully processed ${LAPTOP_BRANDS.length} brands`,
      variant: "default"
    });
    
    return { batches: brandBatches.length };

  } catch (error) {
    console.error('Error in collectLaptops:', error);
    
    // Reset all in-progress statuses on error
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


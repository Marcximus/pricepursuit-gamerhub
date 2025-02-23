
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const PARALLEL_BATCHES = 5; // Process 5 brands concurrently
const DELAY_BETWEEN_BATCHES = 2000; // 2 second delay between batch groups

export async function collectLaptops() {
  console.log('collectLaptops function called');
  
  try {
    console.log('Checking collection status...');

    // First, reset any stale collection statuses (older than 30 minutes)
    const { error: cleanupError } = await supabase
      .from('products')
      .update({ collection_status: 'pending' })
      .eq('collection_status', 'in_progress')
      .lt('last_collection_attempt', new Date(Date.now() - 30 * 60 * 1000).toISOString());

    if (cleanupError) {
      console.error('Error cleaning up stale statuses:', cleanupError);
      throw cleanupError;
    }

    // Get current in-progress collections that aren't stale
    const { data: activeCollections, error: statusError } = await supabase
      .from('products')
      .select('collection_status, last_collection_attempt')
      .eq('collection_status', 'in_progress')
      .gt('last_collection_attempt', new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .limit(1);

    if (statusError) {
      console.error('Status check error:', statusError);
      throw statusError;
    }

    if (activeCollections && activeCollections.length > 0) {
      const timeElapsed = new Date().getTime() - new Date(activeCollections[0].last_collection_attempt).getTime();
      console.log(`Collection in progress, started ${timeElapsed / 1000} seconds ago`);
      
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Create parallel batch groups
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += PARALLEL_BATCHES) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, Math.min(i + PARALLEL_BATCHES, LAPTOP_BRANDS.length)));
    }

    console.log(`Processing ${brandBatches.length} batch groups with ${PARALLEL_BATCHES} brands per group`);

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
          const { error: functionError } = await supabase.functions.invoke('collect-laptops', {
            body: {
              brands: [brand],
              pages_per_brand: 1,
              batch_number: groupIndex * PARALLEL_BATCHES + brandIndex + 1,
              total_batches: LAPTOP_BRANDS.length
            }
          });

          if (functionError) {
            console.error(`Edge function error for ${brand}:`, functionError);
            throw functionError;
          }

          // Update status to completed
          await supabase
            .from('products')
            .update({ collection_status: 'completed' })
            .eq('brand', brand);

          console.log(`Successfully processed ${brand}`);
        } catch (brandError) {
          console.error(`Error processing ${brand}:`, brandError);
          
          // Reset status for failed brand
          await supabase
            .from('products')
            .update({ collection_status: 'pending' })
            .eq('brand', brand);
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

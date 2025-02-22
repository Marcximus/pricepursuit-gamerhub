
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const BRANDS_PER_BATCH = 1; // Process one brand at a time
const DELAY_BETWEEN_BATCHES = 500; // 500ms delay

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

    console.log('Active collections:', activeCollections);

    if (activeCollections && activeCollections.length > 0) {
      const timeElapsed = new Date().getTime() - new Date(activeCollections[0].last_collection_attempt).getTime();
      console.log(`Collection in progress, started ${timeElapsed / 1000} seconds ago`);
      
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Mark the first brand as in progress
    const firstBrand = LAPTOP_BRANDS[0];
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        collection_status: 'in_progress',
        last_collection_attempt: new Date().toISOString()
      })
      .eq('brand', firstBrand);

    if (updateError) {
      console.error('Error updating collection status:', updateError);
      throw updateError;
    }

    // Create batches
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += BRANDS_PER_BATCH) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, i + BRANDS_PER_BATCH));
    }

    console.log(`Processing ${brandBatches.length} batches`);

    // Process each batch
    for (const [index, brands] of brandBatches.entries()) {
      console.log(`Processing batch ${index + 1}/${brandBatches.length}: ${brands.join(', ')}`);
      
      if (index > 0) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

      try {
        const { error: functionError } = await supabase.functions.invoke('collect-laptops', {
          body: {
            brands: brands,
            pages_per_brand: 1, // Changed from 5 to 1
            batch_number: index + 1,
            total_batches: brandBatches.length
          }
        });

        if (functionError) {
          console.error('Edge function error:', functionError);
          throw functionError;
        }

        // Update status to completed for the processed brand
        await supabase
          .from('products')
          .update({ collection_status: 'completed' })
          .eq('brand', brands[0]);

        console.log(`Successfully processed batch ${index + 1}`);
      } catch (batchError) {
        console.error(`Error processing batch ${index + 1}:`, batchError);
        
        // Reset status for failed brand
        await supabase
          .from('products')
          .update({ collection_status: 'pending' })
          .eq('brand', brands[0]);
          
        // Continue with next batch instead of stopping completely
        continue;
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


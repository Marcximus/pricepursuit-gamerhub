
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const BRANDS_PER_BATCH = 2;

export const collectLaptops = async () => {
  try {
    console.log('Starting laptop collection process...');
    
    // Check collection status first
    console.log('Checking if collection is already in progress...');
    const { data: statusData, error: statusError } = await supabase
      .from('products')
      .select('asin, current_price, collection_status')
      .eq('collection_status', 'in_progress')
      .limit(1);

    if (statusError) {
      console.error('Error checking collection status:', statusError);
      throw new Error(`Failed to check collection status: ${statusError.message}`);
    }

    if (statusData && statusData.length > 0) {
      console.log('Collection already in progress, aborting');
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Log current database state for debugging
    const { data: dbState, error: dbError } = await supabase
      .from('products')
      .select('collection_status, current_price')
      .limit(10);

    console.log('Current database state (sample):', dbState);
    if (dbError) {
      console.error('Error checking database state:', dbError);
    }

    // Split brands into smaller batches
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += BRANDS_PER_BATCH) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, i + BRANDS_PER_BATCH));
    }

    console.log(`Created ${brandBatches.length} batches for processing`);

    // Process each batch sequentially
    for (let i = 0; i < brandBatches.length; i++) {
      const batch = brandBatches[i];
      console.log(`Starting batch ${i + 1}/${brandBatches.length}: ${batch.join(', ')}`);

      try {
        console.log('Invoking collect-laptops edge function...');
        const { data, error } = await supabase.functions.invoke('collect-laptops', {
          body: { 
            brands: batch,
            pages_per_brand: 5,
            batch_number: i + 1,
            total_batches: brandBatches.length
          }
        });

        if (error) {
          console.error(`Error in batch ${i + 1}:`, error);
          toast({
            title: `Batch ${i + 1} failed`,
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log(`Batch ${i + 1} completed successfully:`, data);
          toast({
            title: "Batch Progress",
            description: `Completed batch ${i + 1} of ${brandBatches.length}`,
          });
        }

        // Clear any in_progress status that might be stuck
        await supabase
          .from('products')
          .update({ collection_status: 'completed' })
          .eq('collection_status', 'in_progress')
          .in('brand', batch);

      } catch (error) {
        console.error(`Critical error in batch ${i + 1}:`, error);
        toast({
          title: "Error",
          description: `Failed to process batch ${i + 1}: ${error.message}`,
          variant: "destructive"
        });
      }

      // Add delay between batches
      if (i < brandBatches.length - 1) {
        console.log('Waiting before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log('All collection batches completed');
    toast({
      title: "Collection completed",
      description: `Processed all ${brandBatches.length} batches`,
    });

    // Final status check and cleanup
    const { data: finalStatus } = await supabase
      .from('products')
      .select('collection_status')
      .eq('collection_status', 'in_progress');

    if (finalStatus && finalStatus.length > 0) {
      console.log(`Found ${finalStatus.length} items still marked as in_progress, cleaning up...`);
      await supabase
        .from('products')
        .update({ collection_status: 'completed' })
        .eq('collection_status', 'in_progress');
    }

    return { batches: brandBatches.length };

  } catch (error) {
    console.error('Critical error in collectLaptops:', error);
    toast({
      title: "Collection failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

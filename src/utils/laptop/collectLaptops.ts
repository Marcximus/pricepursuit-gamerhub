
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
      const errorMsg = `Failed to check collection status: ${statusError.message}`;
      console.error(errorMsg);
      toast({
        title: "Error checking collection status",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }

    if (statusData && statusData.length > 0) {
      console.log('Collection already in progress:', statusData);
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Split brands into smaller batches
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += BRANDS_PER_BATCH) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, i + BRANDS_PER_BATCH));
    }

    console.log(`Created ${brandBatches.length} batches for processing:`, brandBatches);

    // Process each batch sequentially
    for (let i = 0; i < brandBatches.length; i++) {
      const batch = brandBatches[i];
      console.log(`Starting batch ${i + 1}/${brandBatches.length}: ${batch.join(', ')}`);

      try {
        console.log('Preparing to invoke collect-laptops edge function...');
        
        const requestBody = { 
          brands: batch,
          pages_per_brand: 5,
          batch_number: i + 1,
          total_batches: brandBatches.length
        };
        
        console.log('Edge function request body:', requestBody);
        
        const { data: responseData, error: functionError } = await supabase.functions.invoke('collect-laptops', {
          body: requestBody
        });

        if (functionError) {
          console.error(`Edge function error in batch ${i + 1}:`, functionError);
          toast({
            title: `Batch ${i + 1} failed`,
            description: functionError.message,
            variant: "destructive"
          });
          throw functionError;
        } else {
          console.log(`Edge function response for batch ${i + 1}:`, responseData);
          toast({
            title: "Batch Progress",
            description: `Completed batch ${i + 1} of ${brandBatches.length}`,
          });
        }

        // Clear any in_progress status that might be stuck
        console.log(`Cleaning up in_progress status for batch ${i + 1}...`);
        const { error: cleanupError } = await supabase
          .from('products')
          .update({ collection_status: 'completed' })
          .eq('collection_status', 'in_progress')
          .in('brand', batch);

        if (cleanupError) {
          console.error(`Error cleaning up batch ${i + 1} status:`, cleanupError);
        }

      } catch (error) {
        console.error(`Critical error in batch ${i + 1}:`, error);
        toast({
          title: "Critical Error",
          description: `Failed to process batch ${i + 1}: ${error.message}`,
          variant: "destructive"
        });
        throw error;
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
    const { data: finalStatus, error: finalStatusError } = await supabase
      .from('products')
      .select('collection_status')
      .eq('collection_status', 'in_progress');

    if (finalStatusError) {
      console.error('Error checking final status:', finalStatusError);
    }

    if (finalStatus && finalStatus.length > 0) {
      console.log(`Found ${finalStatus.length} items still marked as in_progress, cleaning up...`);
      const { error: cleanupError } = await supabase
        .from('products')
        .update({ collection_status: 'completed' })
        .eq('collection_status', 'in_progress');

      if (cleanupError) {
        console.error('Error during final cleanup:', cleanupError);
      }
    }

    return { batches: brandBatches.length };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Critical error in collectLaptops:', error);
    toast({
      title: "Collection failed",
      description: errorMsg,
      variant: "destructive"
    });
    throw error;
  }
};

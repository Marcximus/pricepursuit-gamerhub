
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
    console.log('Starting laptop collection...');
    
    // Check collection status first
    const { data: statusData, error: statusError } = await supabase
      .from('products')
      .select('asin, current_price, collection_status')
      .eq('collection_status', 'in_progress')
      .limit(1);

    if (statusError) {
      console.error('Error checking collection status:', statusError);
      throw statusError;
    }

    if (statusData && statusData.length > 0) {
      console.log('Collection already in progress');
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Log current price data for debugging
    const { data: priceCheck, error: priceError } = await supabase
      .from('products')
      .select('asin, current_price')
      .is('current_price', null)
      .limit(5);

    if (priceCheck) {
      console.log('Sample of products missing prices:', priceCheck);
    }

    // Split brands into smaller batches
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += BRANDS_PER_BATCH) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, i + BRANDS_PER_BATCH));
    }

    console.log(`Split collection into ${brandBatches.length} batches`);

    // Process each batch sequentially
    for (let i = 0; i < brandBatches.length; i++) {
      const batch = brandBatches[i];
      console.log(`Processing batch ${i + 1}/${brandBatches.length}: ${batch.join(', ')}`);

      try {
        // Update status for this batch
        await supabase
          .from('products')
          .update({ collection_status: 'in_progress' })
          .in('brand', batch);

        const { data, error } = await supabase.functions.invoke('collect-laptops', {
          body: { 
            brands: batch,
            pages_per_brand: 5, // Updated from 2 to 5 pages per brand
            batch_number: i + 1,
            total_batches: brandBatches.length
          }
        });

        if (error) {
          console.error(`Error processing batch ${i + 1}:`, error);
          toast({
            title: `Batch ${i + 1} failed`,
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log(`Batch ${i + 1} completed:`, data);
          toast({
            title: "Batch progress",
            description: `Completed batch ${i + 1} of ${brandBatches.length}`,
          });
        }

      } catch (error) {
        console.error(`Failed to process batch ${i + 1}:`, error);
      }

      // Add delay between batches
      if (i < brandBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    console.log('Collection batches completed');
    toast({
      title: "Collection completed",
      description: `Processed all ${brandBatches.length} collection batches`,
    });

    // Final status check
    const { data: finalCheck } = await supabase
      .from('products')
      .select('asin, current_price')
      .is('current_price', null)
      .limit(5);

    if (finalCheck && finalCheck.length > 0) {
      console.log('Products still missing prices after collection:', finalCheck);
    }

    return { batches: brandBatches.length };

  } catch (error) {
    console.error('Failed to start collection:', error);
    toast({
      title: "Collection failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

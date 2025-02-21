
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const BRANDS_PER_BATCH = 2; // Process even smaller batches for better reliability

export const collectLaptops = async () => {
  try {
    console.log('Starting laptop collection...');
    
    // Check if collection is already in progress
    const { data: inProgressData } = await supabase
      .from('products')
      .select('collection_status')
      .eq('collection_status', 'in_progress')
      .limit(1);

    if (inProgressData && inProgressData.length > 0) {
      console.log('Collection already in progress');
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

    console.log(`Split collection into ${brandBatches.length} batches`);

    // Process each batch sequentially
    for (let i = 0; i < brandBatches.length; i++) {
      const batch = brandBatches[i];
      console.log(`Starting batch ${i + 1}/${brandBatches.length}: ${batch.join(', ')}`);

      try {
        const { error } = await supabase.functions.invoke('collect-laptops', {
          body: { 
            brands: batch,
            pages_per_brand: 2, // Reduced pages for reliability
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
          // Continue with next batch despite errors
        } else {
          toast({
            title: "Batch progress",
            description: `Completed batch ${i + 1} of ${brandBatches.length}`,
          });
        }

      } catch (error) {
        console.error(`Failed to process batch ${i + 1}:`, error);
        // Continue with next batch despite errors
      }

      // Add a longer delay between batches
      if (i < brandBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
      }
    }

    console.log('All collection batches initiated');
    toast({
      title: "Collection completed",
      description: `Initiated all ${brandBatches.length} collection batches`,
    });

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


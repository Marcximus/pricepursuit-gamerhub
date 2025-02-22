
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const BRANDS_PER_BATCH = 2;
const DELAY_BETWEEN_BATCHES = 500; // 500ms delay

export async function collectLaptops() {
  console.log('collectLaptops function called');
  
  try {
    console.log('Checking collection status...');

    // First, let's clean up any stale collection statuses (older than 1 hour)
    const { error: cleanupError } = await supabase
      .from('products')
      .update({ collection_status: 'pending' })
      .eq('collection_status', 'in_progress')
      .lt('last_collection_attempt', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (cleanupError) {
      console.error('Error cleaning up stale statuses:', cleanupError);
      throw cleanupError;
    }

    // Now check for any active collections
    const { data: statusData, error: statusError } = await supabase
      .from('products')
      .select('collection_status, last_collection_attempt')
      .eq('collection_status', 'in_progress')
      .gt('last_collection_attempt', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(1);

    console.log('Status check result:', { statusData, statusError });

    if (statusError) {
      console.error('Status check error:', statusError);
      throw statusError;
    }

    if (statusData && statusData.length > 0) {
      console.log('Collection already in progress:', statusData[0]);
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Update collection status for the first batch before starting
    const firstBatch = LAPTOP_BRANDS.slice(0, BRANDS_PER_BATCH);
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        collection_status: 'in_progress',
        last_collection_attempt: new Date().toISOString()
      })
      .in('brand', firstBatch);

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
      
      // Add delay before processing each batch (except the first one)
      if (index > 0) {
        console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }

      const { error: functionError } = await supabase.functions.invoke('collect-laptops', {
        body: {
          brands: brands,
          pages_per_brand: 5,
          batch_number: index + 1,
          total_batches: brandBatches.length
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }

      console.log(`Successfully processed batch ${index + 1}`);
    }

    console.log('Collection process initiated successfully');
    return { batches: brandBatches.length };

  } catch (error) {
    console.error('Error in collectLaptops:', error);
    // Clean up collection status on error
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

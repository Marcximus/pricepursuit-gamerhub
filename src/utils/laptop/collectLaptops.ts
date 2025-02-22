
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

// Reduce batch size to minimize concurrent requests
const BRANDS_PER_BATCH = 1;

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

    // Process each batch with increased delays
    for (const [index, brands] of brandBatches.entries()) {
      console.log(`Processing batch ${index + 1}/${brandBatches.length}: ${brands.join(', ')}`);
      
      const { error: functionError } = await supabase.functions.invoke('collect-laptops', {
        body: {
          brands: brands,
          pages_per_brand: 3, // Reduced from 5 to 3 pages per brand
          batch_number: index + 1,
          total_batches: brandBatches.length
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        throw functionError;
      }

      console.log(`Successfully processed batch ${index + 1}`);

      // Increase delay between batches to 10 seconds
      if (index < brandBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
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

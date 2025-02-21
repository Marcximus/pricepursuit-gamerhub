
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const BRANDS_PER_BATCH = 2;

export const collectLaptops = async () => {
  console.log('collectLaptops function called');
  
  try {
    // Check if collection is already running
    const { data: statusData, error: statusError } = await supabase
      .from('products')
      .select('collection_status')
      .eq('collection_status', 'in_progress')
      .limit(1);

    console.log('Status check result:', { statusData, statusError });

    if (statusError) {
      console.error('Status check error:', statusError);
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

    // Create batches
    const brandBatches = [];
    for (let i = 0; i < LAPTOP_BRANDS.length; i += BRANDS_PER_BATCH) {
      brandBatches.push(LAPTOP_BRANDS.slice(i, i + BRANDS_PER_BATCH));
    }

    console.log(`Processing ${brandBatches.length} batches`);

    // Process each batch
    for (const [index, brands] of brandBatches.entries()) {
      console.log(`Processing batch ${index + 1}/${brandBatches.length}: ${brands.join(', ')}`);
      
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

      // Add delay between batches
      if (index < brandBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log('Collection process initiated successfully');
    return { batches: brandBatches.length };

  } catch (error) {
    console.error('Error in collectLaptops:', error);
    toast({
      title: "Collection failed",
      description: error.message,
      variant: "destructive"
    });
    throw error;
  }
};

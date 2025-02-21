
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

const BRANDS_PER_BATCH = 3; // Process brands in smaller batches

export const collectLaptops = async () => {
  try {
    console.log('Starting laptop collection...');
    const totalBrands = LAPTOP_BRANDS.length;
    let processedBrands = 0;

    // Split brands into smaller batches
    for (let i = 0; i < LAPTOP_BRANDS.length; i += BRANDS_PER_BATCH) {
      const brandsBatch = LAPTOP_BRANDS.slice(i, i + BRANDS_PER_BATCH);
      console.log(`Processing batch of brands: ${brandsBatch.join(', ')}`);

      const { data, error } = await supabase.functions.invoke('collect-laptops', {
        body: { 
          brands: brandsBatch,
          pages_per_brand: 3 // Reduced pages per brand for better reliability
        }
      });

      if (error) {
        console.error('Error collecting laptops for batch:', error);
        toast({
          title: "Batch collection warning",
          description: `Failed to process some brands: ${error.message}`,
          variant: "destructive"
        });
        // Continue with next batch despite errors
        continue;
      }

      processedBrands += brandsBatch.length;
      console.log(`Progress: ${processedBrands}/${totalBrands} brands processed`);
      
      // Add a delay between batches to prevent overload
      if (i + BRANDS_PER_BATCH < LAPTOP_BRANDS.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      toast({
        title: "Collection progress",
        description: `Processed ${processedBrands} out of ${totalBrands} brands`,
      });
    }

    console.log('Collection completed for all batches');
    toast({
      title: "Collection completed",
      description: `Successfully processed all ${totalBrands} brands`,
    });
    
    return { success: true, totalBrands };
  } catch (error) {
    console.error('Failed to collect laptops:', error);
    toast({
      title: "Collection failed",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

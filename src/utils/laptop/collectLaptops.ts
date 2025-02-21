
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const LAPTOP_BRANDS = [
  'Lenovo', 'HP', 'Dell', 'Apple', 'Acer', 'ASUS', 'Microsoft',
  'Samsung', 'MSI', 'Razer', 'LG', 'Huawei', 'Toshiba', 'Gigabyte',
  'Alienware', 'Vaio', 'Fsjun', 'Jumper', 'Xiaomi', 'ACEMAGIC'
];

export const collectLaptops = async () => {
  try {
    console.log('Starting laptop collection...');

    // Start the collection process
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      body: { 
        brands: LAPTOP_BRANDS,
        pages_per_brand: 3 // Collect first 3 pages for each brand
      }
    });

    if (error) {
      console.error('Error collecting laptops:', error);
      toast({
        title: "Collection failed",
        description: error.message || "Failed to start laptop collection",
        variant: "destructive"
      });
      throw error;
    }

    console.log('Collection started:', data);
    toast({
      title: "Collection started",
      description: "Started collecting laptops. This may take several minutes.",
    });
    
    return data;
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

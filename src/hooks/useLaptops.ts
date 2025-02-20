import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";

// Fallback static data to ensure we always show something
const staticLaptops: Product[] = [
  {
    id: "1",
    asin: "B0BS3RMPGD",
    title: "HP 2023 15.6\" HD Laptop",
    current_price: 399.99,
    original_price: 499.99,
    rating: 4.5,
    rating_count: 1250,
    image_url: "https://m.media-amazon.com/images/I/71RD3vsjIYL._AC_SL1500_.jpg",
    product_url: "https://www.amazon.com/dp/B0BS3RMPGD",
    processor: "Intel Core i3-1115G4",
    ram: "8GB DDR4",
    storage: "256GB SSD",
    screen_size: "15.6 inches",
    graphics: "Intel UHD Graphics",
    created_at: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    processor_score: 65,
    benchmark_score: 75,
  },
  {
    id: "2",
    asin: "B0BSR384MK",
    title: "Lenovo IdeaPad Gaming 3",
    current_price: 699.99,
    original_price: 899.99,
    rating: 4.7,
    rating_count: 856,
    image_url: "https://m.media-amazon.com/images/I/81zcUFpthDL._AC_SL1500_.jpg",
    product_url: "https://www.amazon.com/dp/B0BSR384MK",
    processor: "AMD Ryzen 5 6600H",
    ram: "16GB DDR5",
    storage: "512GB SSD",
    screen_size: "15.6 inches",
    graphics: "NVIDIA RTX 3050",
    created_at: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    processor_score: 85,
    benchmark_score: 90,
  },
  {
    id: "3",
    asin: "B09RMW1L7Y",
    title: "MacBook Pro 2023",
    current_price: 1299.99,
    original_price: 1499.99,
    rating: 4.9,
    rating_count: 2345,
    image_url: "https://m.media-amazon.com/images/I/61PhD5VsrPL._AC_SL1500_.jpg",
    product_url: "https://www.amazon.com/dp/B09RMW1L7Y",
    processor: "Apple M2 Pro",
    ram: "16GB Unified",
    storage: "512GB SSD",
    screen_size: "14.2 inches",
    graphics: "16-core GPU",
    created_at: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    processor_score: 95,
    benchmark_score: 98,
  }
];

export const collectLaptops = async () => {
  try {
    console.log('Triggering laptop collection...');
    const { data, error } = await supabase.functions.invoke('collect-laptops');
    
    if (error) {
      console.error('Error collecting laptops:', error);
      throw error;
    }
    
    console.log('Laptop collection response:', data);
    return data;
  } catch (error) {
    console.error('Failed to collect laptops:', error);
    throw error;
  }
};

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Fetching laptops from Supabase...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_laptop', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching laptops:', error);
          console.log('Returning static data due to error');
          return staticLaptops;
        }

        if (!data || data.length === 0) {
          console.log('No data from Supabase, returning static data');
          // Try to collect laptops if we don't have any
          collectLaptops().catch(console.error);
          return staticLaptops;
        }

        console.log(`Found ${data.length} laptops from Supabase`);
        return data;
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        console.log('Returning static data due to error');
        return staticLaptops;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: staticLaptops,
  });

  return {
    ...query,
    collectLaptops,
  };
};

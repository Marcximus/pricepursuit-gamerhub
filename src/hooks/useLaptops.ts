
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops, updateLaptops } from "@/utils/laptopCollection";
import type { Product } from "@/types/product";

export { collectLaptops, updateLaptops };

export const useLaptops = () => {
  const query = useQuery({
    queryKey: ['laptops'],
    queryFn: async () => {
      try {
        console.log('Fetching laptops from Supabase...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*, product_reviews(*)')
          .eq('is_laptop', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching laptops:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log('No laptops found in database');
          toast({
            title: "No laptops found",
            description: "Starting initial laptop collection...",
          });
          try {
            await collectLaptops();
          } catch (error) {
            console.error('Failed to start initial collection:', error);
            throw error;
          }
          return [];
        }

        // Log collection and update status
        const pendingCollection = data.filter(l => l.collection_status === 'pending').length;
        const updatingLaptops = data.filter(l => l.update_status === 'updating').length;
        const missingPrices = data.filter(l => l.current_price === null).length;
        
        if (pendingCollection > 0) {
          console.log(`${pendingCollection} laptops pending collection`);
        }
        
        if (updatingLaptops > 0) {
          console.log(`${updatingLaptops} laptops being updated`);
        }

        if (missingPrices > 0) {
          console.log(`${missingPrices} laptops missing price information`);
          // Trigger updates for laptops with missing prices
          if (!updatingLaptops) {
            updateLaptops();
          }
        }

        console.log(`Found ${data.length} laptops in database`);
        return data.map(laptop => {
          const processed = processLaptopData(laptop as Product);
          return processed;
        });
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 15, // Refetch every 15 seconds to check for updates
    retryDelay: 1000,
    retry: 3,
  });

  return {
    ...query,
    collectLaptops,
    updateLaptops,
  };
};

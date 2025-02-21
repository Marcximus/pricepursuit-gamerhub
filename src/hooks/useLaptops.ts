
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopUtils";
import { collectLaptops } from "@/utils/laptopCollection";
import type { Product } from "@/types/product";

export { collectLaptops };

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

        console.log(`Found ${data.length} laptops from database`);
        return data.map(laptop => {
          const processed = processLaptopData(laptop as Product);
          console.log('Processed laptop:', processed);
          return processed;
        });
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        throw error;
      }
    },
    staleTime: 1000 * 30, // 30 seconds to cache the data
    refetchInterval: 1000 * 15, // Refetch every 15 seconds to check for updates
    retryDelay: 1000, // Wait 1 second between retries
    retry: 3, // Retry failed requests 3 times
  });

  return {
    ...query,
    collectLaptops,
  };
};


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
          .not('collection_status', 'eq', 'pending')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching laptops:', error);
          return [];
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
          }
          return [];
        }

        console.log(`Found ${data.length} laptops from database`);
        return data.map(laptop => processLaptopData(laptop as any));
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        return [];
      }
    },
    staleTime: 1000 * 60, // 1 minute to cache the data
    refetchInterval: 1000 * 30, // Refetch every 30 seconds to check for updates
    retryDelay: 1000, // Wait 1 second between retries
    retry: 3, // Retry failed requests 3 times
  });

  return {
    ...query,
    collectLaptops,
  };
};


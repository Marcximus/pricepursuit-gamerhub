
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { processLaptopData } from "@/utils/laptopDataProcessing";
import { collectLaptops } from "@/utils/laptopCollection";

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
        // Process each laptop's data before returning
        return data.map(processLaptopData);
      } catch (error) {
        console.error('Error in useLaptops hook:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours to cache the data
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch every 24 hours to check for updates
    retryDelay: 1000, // Wait 1 second between retries
    retry: 3, // Retry failed requests 3 times
    placeholderData: (previousData) => previousData?.map(processLaptopData), // Process previous data as well
  });

  return {
    ...query,
    collectLaptops,
  };
};

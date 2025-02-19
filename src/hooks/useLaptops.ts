
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const fetchLaptops = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-laptops');
      
      if (error) {
        console.error('Error invoking fetch-laptops function:', error);
        throw new Error('Failed to fetch laptop data');
      }

      if (!Array.isArray(data)) {
        if (data?.error) {
          throw new Error(data.error);
        }
        throw new Error('Invalid response format');
      }

      return data;
    } catch (error) {
      console.error('Error in useLaptops hook:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
  });
};

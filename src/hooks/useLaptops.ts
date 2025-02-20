
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const fetchLaptops = async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-laptops');
      
      if (error) {
        console.error('Error invoking fetch-laptops function:', error);
        throw new Error('Failed to fetch laptop data: ' + error.message);
      }

      if (!data) {
        throw new Error('No data received from fetch-laptops function');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }

      return data;
    } catch (error) {
      console.error('Error in useLaptops hook:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to fetch laptops. Please try again later.'
      });
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

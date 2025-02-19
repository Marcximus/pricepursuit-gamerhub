import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const fetchLaptops = async (): Promise<Product[]> => {
    try {
      // Try to get laptops from the database first
      const { data: dbLaptops, error: dbError } = await supabase
        .from('products')
        .select('*')
        .eq('is_laptop', true)
        .order('current_price', { ascending: true });

      if (dbError) throw dbError;
      
      // If we have recent laptop data, return it
      if (dbLaptops && dbLaptops.length > 0) {
        const mostRecentCheck = new Date(Math.max(...dbLaptops.map(l => new Date(l.last_checked).getTime())));
        const isStale = new Date().getTime() - mostRecentCheck.getTime() > 24 * 60 * 60 * 1000; // 24 hours
        
        if (!isStale) {
          return dbLaptops;
        }
      }

      // Otherwise fetch fresh data
      const { data, error } = await supabase.functions.invoke('fetch-laptops');
      
      if (error) {
        console.error('Error invoking fetch-laptops function:', error);
        throw new Error('Failed to fetch laptop data');
      }

      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response from server');
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
    retry: 1
  });
};

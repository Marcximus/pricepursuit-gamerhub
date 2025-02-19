
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const fetchLaptops = async (): Promise<Product[]> => {
    try {
      // First try to get laptops from the database
      const { data: dbLaptops, error: dbError } = await supabase
        .from('products')
        .select('*')
        .eq('is_laptop', true)
        .order('current_price', { ascending: true });

      if (dbError) throw dbError;
      
      // If we have laptops in the database and they're not stale, return them
      if (dbLaptops && dbLaptops.length > 0) {
        const mostRecentCheck = new Date(Math.max(...dbLaptops.map(l => new Date(l.last_checked).getTime())));
        const isStale = new Date().getTime() - mostRecentCheck.getTime() > 24 * 60 * 60 * 1000; // 24 hours
        
        if (!isStale) {
          console.log('Returning cached laptops from database');
          return dbLaptops;
        }
      }

      // If no laptops or data is stale, fetch new data
      console.log('Fetching fresh laptop data...');
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-laptops');
      
      if (functionError) {
        console.error('Error fetching laptops:', functionError);
        throw functionError;
      }

      return functionData || [];
    } catch (error) {
      console.error('Error in useLaptops hook:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2
  });
};

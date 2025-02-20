
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const fetchLaptops = async (): Promise<Product[]> => {
    try {
      console.log('Fetching laptops...');
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_laptop', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching laptops:', error);
        throw new Error('Failed to fetch laptops: ' + error.message);
      }

      if (!data) {
        console.log('No data received from database');
        return [];
      }

      console.log(`Found ${data.length} laptops:`, data);
      return data;
    } catch (error) {
      console.error('Error in useLaptops hook:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to fetch laptops. Please try again later.'
      });
      return []; // Return empty array instead of throwing to prevent UI from crashing
    }
  };

  return useQuery({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    initialData: [], // Provide initial data to prevent undefined issues
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
  });
};

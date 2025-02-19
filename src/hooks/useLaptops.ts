
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export const useLaptops = () => {
  const fetchLaptops = async (): Promise<Product[]> => {
    const { data: dbLaptops } = await supabase
      .from('products')
      .select('*')
      .eq('is_laptop', true)
      .order('current_price', { ascending: true });

    if (dbLaptops && dbLaptops.length > 0) {
      return dbLaptops;
    }

    const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-laptops');
    if (functionError) throw functionError;
    return functionData;
  };

  return useQuery({
    queryKey: ['laptops'],
    queryFn: fetchLaptops,
  });
};

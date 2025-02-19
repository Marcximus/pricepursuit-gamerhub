
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

const fetchProduct = async (asin: string): Promise<Product> => {
  const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-product', {
    body: { asin }
  });

  if (functionError) throw functionError;
  return functionData;
};

export const useProduct = (asin: string | undefined) => {
  return useQuery({
    queryKey: ['product', asin],
    queryFn: () => fetchProduct(asin!),
    enabled: !!asin,
  });
};

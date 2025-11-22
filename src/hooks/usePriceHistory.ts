import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PriceHistory } from "@/types/product";

const fetchPriceHistory = async (productId: string): Promise<PriceHistory[]> => {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .order('timestamp', { ascending: true })
    .limit(90); // Last 90 days

  if (error) throw error;
  return data || [];
};

export const usePriceHistory = (productId: string | undefined) => {
  return useQuery({
    queryKey: ['priceHistory', productId],
    queryFn: () => fetchPriceHistory(productId!),
    enabled: !!productId,
  });
};

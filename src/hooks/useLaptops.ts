
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/product";

export const ITEMS_PER_PAGE = 50;

export const useAllProducts = () => {
  const { data = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching all products...');
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          *,
          product_reviews (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return products || [];
    },
  });

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const processedData = {
    laptops: data,
    totalCount: data.length,
    totalPages
  };

  return {
    data: processedData,
    isLoading,
    error,
    refetch,
    isRefetching
  };
};


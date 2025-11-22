import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LaptopCard } from '@/components/laptops/LaptopCard';
import type { Product } from '@/types/product';

interface SimilarLaptopsProps {
  product: Product;
}

export function SimilarLaptops({ product }: SimilarLaptopsProps) {
  const { data: similarLaptops, isLoading } = useQuery({
    queryKey: ['similarLaptops', product.id],
    queryFn: async () => {
      const minPrice = product.current_price - 200;
      const maxPrice = product.current_price + 200;
      const minScore = (product.processor_score || 0) - 1000;
      const maxScore = (product.processor_score || 0) + 1000;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .neq('id', product.id)
        .gte('current_price', minPrice)
        .lte('current_price', maxPrice)
        .gte('processor_score', minScore)
        .lte('processor_score', maxScore)
        .limit(6);

      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-foreground mb-6">Similar Laptops</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg h-96 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!similarLaptops || similarLaptops.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">Similar Laptops You Might Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarLaptops.map((laptop) => (
          <LaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>
    </section>
  );
}

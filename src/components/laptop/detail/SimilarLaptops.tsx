import { useMemo } from 'react';
import { LaptopCard } from '@/components/laptops/LaptopCard';
import { mockLaptopDetails } from '@/data/mockLaptopDetail';
import type { Product } from '@/types/product';

interface SimilarLaptopsProps {
  product: Product;
}

export function SimilarLaptops({ product }: SimilarLaptopsProps) {
  // Get similar laptops from mock data
  const similarLaptops = useMemo(() => {
    const allLaptops = Object.values(mockLaptopDetails);
    return allLaptops
      .filter(laptop => laptop.asin !== product.asin)
      .slice(0, 3);
  }, [product.asin]);

  if (similarLaptops.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 lg:mb-10">
      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 lg:mb-6">Similar Laptops You Might Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarLaptops.map((laptop) => (
          <LaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>
    </section>
  );
}

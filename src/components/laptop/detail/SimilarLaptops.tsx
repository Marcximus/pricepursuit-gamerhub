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
    <section className="mb-20 pt-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-8">Similar Laptops You Might Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {similarLaptops.slice(0, 2).map((laptop) => (
            <LaptopCard key={laptop.id} laptop={laptop} />
          ))}
        </div>
      </div>
    </section>
  );
}

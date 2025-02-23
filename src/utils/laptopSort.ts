
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";

export const sortLaptops = (laptops: Product[], sortBy: SortOption): Product[] => {
  console.log('Sorting laptops:', { 
    sortBy, 
    laptopCount: laptops.length,
    samplePrices: laptops.slice(0, 3).map(l => l.current_price)
  });

  return [...laptops].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': {
        const priceA = a.current_price ?? Number.MAX_SAFE_INTEGER;
        const priceB = b.current_price ?? Number.MAX_SAFE_INTEGER;
        return priceA - priceB;
      }
      case 'price-desc': {
        const priceA = a.current_price ?? 0;
        const priceB = b.current_price ?? 0;
        return priceB - priceA;
      }
      case 'rating-desc': {
        const scoreA = a.wilson_score ?? 0;
        const scoreB = b.wilson_score ?? 0;
        return scoreB - scoreA;
      }
      default:
        return 0;
    }
  });
};

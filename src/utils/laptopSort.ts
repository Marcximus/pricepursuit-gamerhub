
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";

export const sortLaptops = (laptops: Product[], sortBy: SortOption): Product[] => {
  return [...laptops].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.current_price || 999999) - (b.current_price || 999999);
      case 'price-desc':
        return (b.current_price || 0) - (a.current_price || 0);
      case 'rating-desc':
        return (b.wilson_score || 0) - (a.wilson_score || 0);
      default:
        return 0;
    }
  });
};


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
        // Put null prices at the end when sorting ascending
        return priceA - priceB;
      }
      case 'price-desc': {
        const priceA = a.current_price ?? -1;
        const priceB = b.current_price ?? -1;
        // Put null prices at the end when sorting descending
        if (priceA === -1) return 1;
        if (priceB === -1) return -1;
        return priceB - priceA;
      }
      case 'rating-desc': {
        // Consider both rating and number of reviews for better sorting
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        const countA = a.rating_count ?? 0;
        const countB = b.rating_count ?? 0;

        // If ratings are significantly different, sort by rating
        if (Math.abs(ratingA - ratingB) > 0.3) {
          return ratingB - ratingA;
        }

        // If ratings are similar, consider number of reviews
        return countB - countA;
      }
      default:
        return 0;
    }
  });
};

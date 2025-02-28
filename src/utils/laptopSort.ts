
import type { Product } from "@/types/product";
import type { SortOption } from "@/components/laptops/LaptopSort";

/**
 * Calculates a weighted rating score that considers both rating value and number of reviews
 * This creates a more reliable sorting metric than just using the raw rating
 * 
 * @param rating The product rating (typically 0-5)
 * @param reviewCount The number of reviews
 * @returns A weighted score that balances rating value with statistical significance
 */
const calculateWeightedRating = (rating: number, reviewCount: number): number => {
  // If there's no rating or no reviews, return the lowest possible score
  if (!rating || !reviewCount) return 0;
  
  // Use a weighted formula that gives more confidence as review count increases
  // This is a simplified version of a Wilson score interval lower bound
  const weight = Math.min(1, Math.log10(reviewCount + 1) / 2);
  
  // Weight between the actual rating and a neutral rating (3.0)
  // As weight approaches 1, we trust the actual rating more
  // As weight approaches 0, we pull the rating toward the neutral 3.0
  return (rating * weight) + (3.0 * (1 - weight));
};

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
        // Calculate weighted ratings that consider both rating value and number of reviews
        const ratingA = a.rating ?? 0;
        const ratingB = b.rating ?? 0;
        const countA = a.rating_count ?? 0;
        const countB = b.rating_count ?? 0;
        
        // Calculate weighted scores
        const weightedScoreA = calculateWeightedRating(ratingA, countA);
        const weightedScoreB = calculateWeightedRating(ratingB, countB);
        
        // Sort by the weighted scores
        return weightedScoreB - weightedScoreA;
      }
      default:
        return 0;
    }
  });
};

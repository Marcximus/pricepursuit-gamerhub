
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

/**
 * Apply price range filtering to a laptop
 */
export const applyPriceFilter = (
  laptop: Product,
  filters: FilterOptions
): boolean => {
  const price = laptop.current_price || 0;
  return price >= filters.priceRange.min && price <= filters.priceRange.max;
};

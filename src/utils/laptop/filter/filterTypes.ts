
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

export type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

export interface FilterResult {
  laptops: Product[];
  totalCount: number;
  message?: string;
}

// Re-export the FilterOptions type to have it available in this module
export type { FilterOptions } from "@/components/laptops/LaptopFilters";

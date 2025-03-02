
import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterCategoryKey } from "../types";

/**
 * Hook that creates category mappings for product fields and options
 * Used to optimize lookups in the filtering system
 */
export const useCategoryMappings = (
  processors: Set<string>,
  ramSizes: Set<string>,
  storageOptions: Set<string>,
  graphicsCards: Set<string>,
  screenSizes: Set<string>,
  brands: Set<string>
) => {
  return useMemo(() => {
    // Map categories to their field keys for fast lookups
    const categoryToField: Record<FilterCategoryKey, keyof Product> = {
      brands: 'brand',
      processors: 'processor',
      ramSizes: 'ram',
      storageOptions: 'storage',
      graphicsCards: 'graphics',
      screenSizes: 'screen_size'
    };
    
    // Map categories to option sets for faster lookup
    const categoryToOptions: Record<FilterCategoryKey, Set<string>> = {
      brands,
      processors,
      ramSizes,
      storageOptions,
      graphicsCards,
      screenSizes
    };

    return {
      categoryToField,
      categoryToOptions
    };
  }, [processors, ramSizes, storageOptions, graphicsCards, screenSizes, brands]);
};

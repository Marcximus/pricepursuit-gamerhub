
import { useMemo } from "react";
import type { Product } from "@/types/product";
import { getProcessorValue, getGraphicsValue } from "@/utils/laptop/hardwareScoring";
import { 
  normalizeRam,
  normalizeStorage,
  normalizeScreenSize,
  normalizeGraphics,
  normalizeProcessor,
  normalizeBrand,
  normalizeModel
} from "@/utils/laptop/valueNormalizer";
import { getRamValue, getStorageValue, getScreenSizeValue } from "@/utils/laptop/valueParser";
import type { FilterableProductKeys } from "@/utils/laptop/filter";

export const useLaptopFilters = (laptops: Product[] | undefined) => {
  return useMemo(() => {
    if (!laptops || laptops.length === 0) {
      console.log('No laptops available for generating filter options');
      return {
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
        brands: new Set<string>(),
      };
    }

    const getUniqueValues = (key: FilterableProductKeys) => {
      const validValues = laptops
        .map(laptop => {
          const value = laptop[key];
          if (!value || typeof value !== 'string' || value.trim() === '') {
            return null;
          }

          switch (key) {
            case 'ram':
              return normalizeRam(value);
            case 'storage':
              return normalizeStorage(value);
            case 'screen_size':
              return normalizeScreenSize(value);
            case 'graphics':
              return normalizeGraphics(value);
            case 'processor':
              return normalizeProcessor(value);
            case 'brand': {
              // Apply more aggressive normalization for brands
              const normalizedBrand = normalizeBrand(value, laptop.title);
              // Filter out clearly incorrect brand values
              if (normalizedBrand === 'Unknown Brand' || 
                  normalizedBrand.toLowerCase().includes('series') ||
                  normalizedBrand.length < 2) {
                return null;
              }
              return normalizedBrand;
            }
            default:
              return value.trim();
          }
        })
        .filter((value): value is string => value !== null && value !== '');

      const uniqueValues = Array.from(new Set(validValues));

      if (key === 'ram') {
        uniqueValues.sort((a, b) => getRamValue(b) - getRamValue(a));
      } else if (key === 'storage') {
        uniqueValues.sort((a, b) => getStorageValue(b) - getStorageValue(a));
      } else if (key === 'processor') {
        uniqueValues.sort((a, b) => getProcessorValue(b) - getProcessorValue(a));
      } else if (key === 'graphics') {
        uniqueValues.sort((a, b) => getGraphicsValue(b) - getGraphicsValue(a));
      } else if (key === 'screen_size') {
        uniqueValues.sort((a, b) => getScreenSizeValue(b) - getScreenSizeValue(a));
      } else if (key === 'brand') {
        uniqueValues.sort((a, b) => a.localeCompare(b));
      } else {
        uniqueValues.sort((a, b) => a.localeCompare(b));
      }

      // Log the sorted values for debugging
      if (uniqueValues.length > 0) {
        console.log(`Sorted ${key} filters:`, uniqueValues);
      }

      return new Set(uniqueValues);
    };

    return {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };
  }, [laptops]);
};

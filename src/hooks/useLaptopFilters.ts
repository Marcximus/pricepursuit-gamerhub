
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
        brands: new Set<string>(),        // First - most important
        processors: new Set<string>(),    // Second - key spec
        ramSizes: new Set<string>(),      // Third - key spec
        storageOptions: new Set<string>(), // Fourth - key spec
        graphicsCards: new Set<string>(),  // Fifth - key spec
        screenSizes: new Set<string>(),    // Last - less critical
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

      // Custom sorting logic for each filter type to create a more intuitive ordering
      if (key === 'ram') {
        // Sort RAM by capacity (descending)
        uniqueValues.sort((a, b) => getRamValue(b) - getRamValue(a));
      } else if (key === 'storage') {
        // Sort storage by capacity (descending)
        uniqueValues.sort((a, b) => getStorageValue(b) - getStorageValue(a));
      } else if (key === 'processor') {
        // Sort processors by overall performance (descending)
        // Group by manufacturer then by series/generation
        const processorGroups: Record<string, string[]> = {
          'Apple': [],
          'Intel': [],
          'AMD': [],
          'Other': []
        };
        
        // Group processors by manufacturer
        uniqueValues.forEach(proc => {
          if (proc.includes('Apple') || proc.includes('M1') || proc.includes('M2') || proc.includes('M3')) {
            processorGroups['Apple'].push(proc);
          } else if (proc.includes('Intel')) {
            processorGroups['Intel'].push(proc);
          } else if (proc.includes('AMD') || proc.includes('Ryzen')) {
            processorGroups['AMD'].push(proc);
          } else {
            processorGroups['Other'].push(proc);
          }
        });
        
        // Sort each group by performance
        for (const group in processorGroups) {
          processorGroups[group].sort((a, b) => getProcessorValue(b) - getProcessorValue(a));
        }
        
        // Create ordered list with Apple first, then Intel, then AMD
        const sortedProcessors = [
          ...processorGroups['Apple'],
          ...processorGroups['Intel'],
          ...processorGroups['AMD'],
          ...processorGroups['Other']
        ];
        
        return new Set(sortedProcessors);
      } else if (key === 'graphics') {
        // Sort graphics by performance tier (descending)
        // Group by manufacturer
        const graphicsGroups: Record<string, string[]> = {
          'NVIDIA': [],
          'AMD': [],
          'Intel': [],
          'Apple': [],
          'Other': []
        };
        
        // Group graphics by manufacturer
        uniqueValues.forEach(gpu => {
          if (gpu.includes('NVIDIA') || gpu.includes('RTX') || gpu.includes('GTX')) {
            graphicsGroups['NVIDIA'].push(gpu);
          } else if (gpu.includes('AMD') || gpu.includes('Radeon')) {
            graphicsGroups['AMD'].push(gpu);
          } else if (gpu.includes('Intel')) {
            graphicsGroups['Intel'].push(gpu);
          } else if (gpu.includes('Apple') || gpu.includes('M1') || gpu.includes('M2') || gpu.includes('M3')) {
            graphicsGroups['Apple'].push(gpu);
          } else {
            graphicsGroups['Other'].push(gpu);
          }
        });
        
        // Sort each group by performance
        for (const group in graphicsGroups) {
          graphicsGroups[group].sort((a, b) => getGraphicsValue(b) - getGraphicsValue(a));
        }
        
        // Create ordered list with dedicated GPUs first
        const sortedGraphics = [
          ...graphicsGroups['NVIDIA'],
          ...graphicsGroups['AMD'],
          ...graphicsGroups['Apple'],
          ...graphicsGroups['Intel'],
          ...graphicsGroups['Other']
        ];
        
        return new Set(sortedGraphics);
      } else if (key === 'screen_size') {
        // Sort screen sizes by diagonal size (descending)
        uniqueValues.sort((a, b) => getScreenSizeValue(b) - getScreenSizeValue(a));
      } else if (key === 'brand') {
        // Sort brands by popularity/market share with major brands first
        const brandOrder: Record<string, number> = {
          'Apple': 1,
          'Dell': 2,
          'HP': 3,
          'Lenovo': 4,
          'ASUS': 5,
          'Acer': 6,
          'MSI': 7,
          'Samsung': 8,
          'Microsoft': 9,
          'Razer': 10,
          'Alienware': 11,
          'LG': 12
        };
        
        uniqueValues.sort((a, b) => {
          const orderA = brandOrder[a] || 100;
          const orderB = brandOrder[b] || 100;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          return a.localeCompare(b);
        });
      } else {
        // Default sorting for any other filters
        uniqueValues.sort((a, b) => a.localeCompare(b));
      }

      // Log the sorted values for debugging
      if (uniqueValues.length > 0) {
        console.log(`Sorted ${key} filters:`, uniqueValues);
      }

      return new Set(uniqueValues);
    };

    return {
      // Reordered in a more user-centric way
      brands: getUniqueValues('brand'),            // First filter category
      processors: getUniqueValues('processor'),    // Second filter category
      ramSizes: getUniqueValues('ram'),            // Third filter category
      storageOptions: getUniqueValues('storage'),  // Fourth filter category
      graphicsCards: getUniqueValues('graphics'),  // Fifth filter category
      screenSizes: getUniqueValues('screen_size'), // Last filter category
    };
  }, [laptops]);
};

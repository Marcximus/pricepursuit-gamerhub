
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

const normalizeRam = (ram: string): string => {
  // Extract the numeric value and standardize to GB
  const match = ram.match(/(\d+)\s*(GB|TB|MB)/i);
  if (match) {
    const [, value, unit] = match;
    const numValue = parseInt(value);
    if (unit.toLowerCase() === 'tb') {
      return `${numValue * 1024} GB`;
    } else if (unit.toLowerCase() === 'mb') {
      return `${Math.round(numValue / 1024)} GB`;
    }
    return `${numValue} GB`;
  }
  return ram;
};

const getRamValue = (ram: string): number => {
  // Convert all RAM values to GB for comparison
  const match = ram.match(/(\d+)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, value, unit] = match;
  const numValue = parseInt(value);
  
  switch (unit.toLowerCase()) {
    case 'tb':
      return numValue * 1024;
    case 'mb':
      return Math.round(numValue / 1024);
    case 'gb':
      return numValue;
    default:
      return 0;
  }
};

const normalizeStorage = (storage: string): string => {
  // Extract the numeric value and standardize to GB/TB
  const match = storage.match(/(\d+)\s*(GB|TB|MB)/i);
  if (match) {
    const [, value, unit] = match;
    const numValue = parseInt(value);
    if (unit.toLowerCase() === 'tb') {
      return `${numValue} TB`;
    } else if (unit.toLowerCase() === 'gb' && numValue >= 1024) {
      return `${Math.round(numValue / 1024)} TB`;
    }
    return `${numValue} GB`;
  }
  return storage;
};

const normalizeScreenSize = (size: string): string => {
  // Extract the numeric value and standardize to inches
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    return `${match[1]}"`;
  }
  return size;
};

const normalizeGraphics = (graphics: string): string => {
  // Group by manufacturer and series
  const nvidia = graphics.match(/NVIDIA\s+(RTX|GTX)\s*(\d+)/i);
  if (nvidia) {
    return `NVIDIA ${nvidia[1]} ${nvidia[2].charAt(0)}XXX`;
  }
  const amd = graphics.match(/AMD\s+Radeon/i);
  if (amd) {
    return "AMD Radeon";
  }
  const intel = graphics.match(/Intel\s+(Iris|UHD|HD)/i);
  if (intel) {
    return `Intel ${intel[1]} Graphics`;
  }
  return graphics;
};

const normalizeProcessor = (processor: string): string => {
  // Group by manufacturer and generation
  const intel = processor.match(/Intel\s+Core\s+(i\d)-(\d{4,5})/i);
  if (intel) {
    return `Intel Core ${intel[1]} ${intel[2].charAt(0)}th Gen`;
  }
  const amd = processor.match(/AMD\s+Ryzen\s+(\d)\s+(\d{4})/i);
  if (amd) {
    return `AMD Ryzen ${amd[1]} ${amd[2].charAt(0)}XXX`;
  }
  return processor;
};

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

          // Apply normalization based on the field type
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
            default:
              return value.trim();
          }
        })
        .filter((value): value is string => value !== null);

      // Create a unique set of normalized values and sort them
      const uniqueValues = Array.from(new Set(validValues)).sort((a, b) => {
        if (key === 'ram') {
          return getRamValue(a) - getRamValue(b);
        }
        if (key === 'storage') {
          // Extract numeric values for proper storage sorting
          const getStorageValue = (str: string) => {
            const match = str.match(/(\d+)\s*(TB|GB)/i);
            if (!match) return 0;
            const [, value, unit] = match;
            return parseInt(value) * (unit.toLowerCase() === 'tb' ? 1024 : 1);
          };
          return getStorageValue(a) - getStorageValue(b);
        }
        return a.localeCompare(b);
      });
      
      console.log(`Generated ${key} filter options:`, {
        total: uniqueValues.length,
        values: uniqueValues,
        datasetSize: laptops.length
      });
      
      return new Set(uniqueValues);
    };

    const filterOptions = {
      processors: getUniqueValues('processor'),
      ramSizes: getUniqueValues('ram'),
      storageOptions: getUniqueValues('storage'),
      graphicsCards: getUniqueValues('graphics'),
      screenSizes: getUniqueValues('screen_size'),
      brands: getUniqueValues('brand'),
    };

    console.log('Generated all filter options:', {
      totalLaptops: laptops.length,
      brands: Array.from(filterOptions.brands).length,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [laptops]);
};

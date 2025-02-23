
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

export const useLaptopFilters = (laptops: Product[] | undefined, allFilteredLaptops?: Product[]) => {
  return useMemo(() => {
    const datasetForFilters = allFilteredLaptops || laptops;

    const getUniqueValues = (key: FilterableProductKeys) => {
      if (!datasetForFilters || datasetForFilters.length === 0) {
        console.log(`No laptops available for ${key} filter`);
        return new Set<string>();
      }
      
      const validValues = datasetForFilters
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
        if (key === 'ram' || key === 'storage') {
          // Extract numeric values for proper sorting
          const getNumber = (str: string) => parseInt(str.match(/\d+/)?.[0] || '0');
          return getNumber(a) - getNumber(b);
        }
        return a.localeCompare(b);
      });
      
      console.log(`Generated ${key} filter options:`, {
        total: uniqueValues.length,
        values: uniqueValues,
        datasetSize: datasetForFilters.length
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
      totalLaptops: datasetForFilters?.length,
      brands: Array.from(filterOptions.brands).length,
      processors: Array.from(filterOptions.processors).length,
      ram: Array.from(filterOptions.ramSizes).length,
      storage: Array.from(filterOptions.storageOptions).length,
      graphics: Array.from(filterOptions.graphicsCards).length,
      screenSizes: Array.from(filterOptions.screenSizes).length
    });

    return filterOptions;
  }, [laptops, allFilteredLaptops]);
};


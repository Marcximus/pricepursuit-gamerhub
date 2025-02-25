
import { useMemo } from "react";
import type { Product } from "@/types/product";

type FilterableProductKeys = 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand';

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

const getStorageValue = (storage: string): number => {
  // Extract numeric value and convert to GB for comparison
  const match = storage.match(/(\d+)\s*(GB|TB|MB)/i);
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

const normalizeRam = (ram: string): string => {
  const gbValue = getRamValue(ram);
  if (gbValue === 0) return ram;
  return `${gbValue} GB`;
};

const normalizeStorage = (storage: string): string => {
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Filter out invalid or unrealistic storage values (less than 32GB)
  if (gbValue < 32) {
    return '';
  }
  
  // Always return in GB format
  return `${gbValue} GB`;
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
        .filter((value): value is string => value !== null && value !== '');

      // Create a unique set of normalized values
      const uniqueValues = Array.from(new Set(validValues));

      // Sort based on the field type
      if (key === 'ram') {
        uniqueValues.sort((a, b) => {
          const valueA = parseInt(a.split(' ')[0]);
          const valueB = parseInt(b.split(' ')[0]);
          return valueA - valueB;
        });
      } else if (key === 'storage') {
        uniqueValues.sort((a, b) => {
          const valueA = parseInt(a.split(' ')[0]);
          const valueB = parseInt(b.split(' ')[0]);
          return valueA - valueB;
        });
      } else {
        uniqueValues.sort((a, b) => a.localeCompare(b));
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


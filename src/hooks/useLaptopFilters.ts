
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

const getProcessorValue = (processor: string): number => {
  // Higher value = better processor
  let score = 0;
  
  // CPU generation detection
  const genMatch = processor.match(/(\d+)(?:th|rd|nd|st)?\s+Gen/i);
  if (genMatch) {
    score += parseInt(genMatch[1]) * 1000;
  }
  
  // CPU tier detection
  if (processor.includes('i9')) score += 9000;
  else if (processor.includes('i7')) score += 7000;
  else if (processor.includes('i5')) score += 5000;
  else if (processor.includes('i3')) score += 3000;
  else if (processor.includes('Ryzen 9')) score += 9000;
  else if (processor.includes('Ryzen 7')) score += 7000;
  else if (processor.includes('Ryzen 5')) score += 5000;
  else if (processor.includes('Ryzen 3')) score += 3000;
  else if (processor.includes('M3')) score += 9500;
  else if (processor.includes('M2')) score += 8500;
  else if (processor.includes('M1')) score += 7500;
  
  // CPU manufacturer bonus
  if (processor.includes('Apple')) score += 500;
  
  return score;
};

const getGraphicsValue = (graphics: string): number => {
  // Higher value = better graphics
  let score = 0;
  
  // GPU tier detection
  if (graphics.includes('RTX 40')) score += 40000;
  else if (graphics.includes('RTX 30')) score += 30000;
  else if (graphics.includes('RTX 20')) score += 20000;
  else if (graphics.includes('RTX')) score += 15000;
  else if (graphics.includes('GTX 16')) score += 16000;
  else if (graphics.includes('GTX 10')) score += 10000;
  else if (graphics.includes('GTX')) score += 5000;
  else if (graphics.includes('Radeon RX')) score += 8000;
  else if (graphics.includes('Radeon')) score += 3000;
  else if (graphics.includes('Iris Xe')) score += 2000;
  else if (graphics.includes('UHD')) score += 1000;
  else if (graphics.includes('HD')) score += 500;
  
  // Model number detection
  const modelMatch = graphics.match(/\b(\d{4})\b/);
  if (modelMatch) {
    score += parseInt(modelMatch[1]);
  }
  
  return score;
};

const getScreenSizeValue = (size: string): number => {
  // Extract the numeric value and convert to inches
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
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

      // Sort based on the field type (from best to worst)
      if (key === 'ram') {
        uniqueValues.sort((a, b) => {
          const valueA = getRamValue(a);
          const valueB = getRamValue(b);
          return valueB - valueA; // Descending order (higher RAM is better)
        });
      } else if (key === 'storage') {
        uniqueValues.sort((a, b) => {
          const valueA = getStorageValue(a);
          const valueB = getStorageValue(b);
          return valueB - valueA; // Descending order (higher storage is better)
        });
      } else if (key === 'processor') {
        uniqueValues.sort((a, b) => {
          const valueA = getProcessorValue(a);
          const valueB = getProcessorValue(b);
          return valueB - valueA; // Descending order (higher score is better)
        });
      } else if (key === 'graphics') {
        uniqueValues.sort((a, b) => {
          const valueA = getGraphicsValue(a);
          const valueB = getGraphicsValue(b);
          return valueB - valueA; // Descending order (higher score is better)
        });
      } else if (key === 'screen_size') {
        uniqueValues.sort((a, b) => {
          const valueA = getScreenSizeValue(a);
          const valueB = getScreenSizeValue(b);
          return valueB - valueA; // Descending order (larger screens first)
        });
      } else if (key === 'brand') {
        // Sort brands alphabetically
        uniqueValues.sort((a, b) => a.localeCompare(b));
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


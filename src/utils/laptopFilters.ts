
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

// Helper functions to normalize values for comparison
const normalizeProcessor = (value: string): string => {
  return value.toLowerCase().trim();
};

const normalizeRam = (value: string): string => {
  return value.toLowerCase().trim();
};

const normalizeStorage = (value: string): string => {
  return value.toLowerCase().trim();
};

const normalizeGraphics = (value: string): string => {
  return value.toLowerCase().trim();
};

const normalizeScreenSize = (value: string): string => {
  // Extract just the numeric part for easier comparison
  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? match[1] : value.toLowerCase().trim();
};

export const filterLaptops = (laptops: Product[], filters: FilterOptions): Product[] => {
  console.log('Starting filtering with:', {
    totalLaptops: laptops.length,
    activeFilters: {
      priceRange: filters.priceRange,
      processors: filters.processors.size,
      ram: filters.ramSizes.size,
      storage: filters.storageOptions.size,
      graphics: filters.graphicsCards.size,
      screenSizes: filters.screenSizes.size,
      brands: filters.brands.size
    }
  });

  return laptops.filter(laptop => {
    // Price Range Filter
    const price = laptop.current_price || 0;
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      return false;
    }

    // Brand Filter
    if (filters.brands.size > 0 && laptop.brand) {
      if (!filters.brands.has(laptop.brand)) {
        return false;
      }
    }

    // Processor Filter
    if (filters.processors.size > 0 && laptop.processor) {
      const normalizedLaptopProcessor = normalizeProcessor(laptop.processor);
      const matchesProcessor = Array.from(filters.processors).some(selectedProcessor => {
        const normalizedSelectedProcessor = normalizeProcessor(selectedProcessor);
        return normalizedLaptopProcessor.includes(normalizedSelectedProcessor);
      });
      
      if (!matchesProcessor) {
        return false;
      }
    }

    // RAM Filter
    if (filters.ramSizes.size > 0 && laptop.ram) {
      const normalizedLaptopRam = normalizeRam(laptop.ram);
      const matchesRam = Array.from(filters.ramSizes).some(selectedRam => {
        const normalizedSelectedRam = normalizeRam(selectedRam);
        return normalizedLaptopRam.includes(normalizedSelectedRam);
      });
      
      if (!matchesRam) {
        return false;
      }
    }

    // Storage Filter
    if (filters.storageOptions.size > 0 && laptop.storage) {
      const normalizedLaptopStorage = normalizeStorage(laptop.storage);
      const matchesStorage = Array.from(filters.storageOptions).some(selectedStorage => {
        const normalizedSelectedStorage = normalizeStorage(selectedStorage);
        return normalizedLaptopStorage.includes(normalizedSelectedStorage);
      });
      
      if (!matchesStorage) {
        return false;
      }
    }

    // Graphics Filter
    if (filters.graphicsCards.size > 0 && laptop.graphics) {
      const normalizedLaptopGraphics = normalizeGraphics(laptop.graphics);
      const matchesGraphics = Array.from(filters.graphicsCards).some(selectedGraphics => {
        const normalizedSelectedGraphics = normalizeGraphics(selectedGraphics);
        return normalizedLaptopGraphics.includes(normalizedSelectedGraphics);
      });
      
      if (!matchesGraphics) {
        return false;
      }
    }

    // Screen Size Filter
    if (filters.screenSizes.size > 0 && laptop.screen_size) {
      const normalizedLaptopScreenSize = normalizeScreenSize(laptop.screen_size);
      const matchesScreenSize = Array.from(filters.screenSizes).some(selectedScreenSize => {
        const normalizedSelectedScreenSize = normalizeScreenSize(selectedScreenSize);
        return normalizedLaptopScreenSize.includes(normalizedSelectedScreenSize);
      });
      
      if (!matchesScreenSize) {
        return false;
      }
    }

    return true;
  });
};


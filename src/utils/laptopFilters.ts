
import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

// Helper parsing functions for consistent value extraction
const parseRamValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, amount, unit] = match;
  const numValue = parseInt(amount);
  
  switch (unit.toLowerCase()) {
    case 'tb': return numValue * 1024;
    case 'mb': return numValue / 1024;
    case 'gb': return numValue;
    default: return 0;
  }
};

const parseStorageValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, amount, unit] = match;
  const numValue = parseInt(amount);
  
  switch (unit.toLowerCase()) {
    case 'tb': return numValue * 1024;
    case 'mb': return numValue / 1024;
    case 'gb': return numValue;
    default: return 0;
  }
};

const parseScreenSize = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
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

  const filteredLaptops = laptops.filter(laptop => {
    // Track why each laptop is filtered out for debugging
    const filterReasons: string[] = [];
    
    // Price Range Filter
    const price = laptop.current_price || 0;
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      filterReasons.push(`Price out of range: ${price} not in [${filters.priceRange.min}-${filters.priceRange.max}]`);
      return false;
    }

    // Brand Filter
    if (filters.brands.size > 0) {
      if (!laptop.brand || !filters.brands.has(laptop.brand)) {
        filterReasons.push(`Brand mismatch: ${laptop.brand}`);
        return false;
      }
    }

    // Processor Filter
    if (filters.processors.size > 0 && laptop.processor) {
      // Get all selected processors
      const processorArray = Array.from(filters.processors);
      
      // Check if any of the selected processors match this laptop
      const matchesProcessor = processorArray.some(selectedProcessor => {
        return laptop.processor?.toLowerCase().includes(selectedProcessor.toLowerCase());
      });
      
      if (!matchesProcessor) {
        filterReasons.push(`Processor mismatch: ${laptop.processor}`);
        return false;
      }
    }

    // RAM Filter - Using numeric comparison
    if (filters.ramSizes.size > 0 && laptop.ram) {
      const laptopRamGB = parseRamValue(laptop.ram);
      
      // Check if any selected RAM size matches
      const matchesRam = Array.from(filters.ramSizes).some(selectedRam => {
        const selectedRamGB = parseRamValue(selectedRam);
        // Allow exact match or approximately the same value (accounts for "16GB" vs "16 GB DDR4")
        return Math.abs(laptopRamGB - selectedRamGB) < 0.5;
      });
      
      if (!matchesRam) {
        filterReasons.push(`RAM mismatch: ${laptop.ram} (${laptopRamGB}GB)`);
        return false;
      }
    }

    // Storage Filter - Using numeric comparison
    if (filters.storageOptions.size > 0 && laptop.storage) {
      const laptopStorageGB = parseStorageValue(laptop.storage);
      
      // Check if any selected storage size matches
      const matchesStorage = Array.from(filters.storageOptions).some(selectedStorage => {
        const selectedStorageGB = parseStorageValue(selectedStorage);
        // Allow matches that are close enough (accounts for "512GB" vs "512GB SSD")
        return Math.abs(laptopStorageGB - selectedStorageGB) < 0.5;
      });
      
      if (!matchesStorage) {
        filterReasons.push(`Storage mismatch: ${laptop.storage} (${laptopStorageGB}GB)`);
        return false;
      }
    }

    // Graphics Filter
    if (filters.graphicsCards.size > 0 && laptop.graphics) {
      // Get all selected graphics cards
      const graphicsArray = Array.from(filters.graphicsCards);
      
      // Check if any of the selected graphics cards match
      const matchesGraphics = graphicsArray.some(selectedGraphics => {
        return laptop.graphics?.toLowerCase().includes(selectedGraphics.toLowerCase());
      });
      
      if (!matchesGraphics) {
        filterReasons.push(`Graphics mismatch: ${laptop.graphics}`);
        return false;
      }
    }

    // Screen Size Filter - Using numeric comparison
    if (filters.screenSizes.size > 0 && laptop.screen_size) {
      const laptopScreenSize = parseScreenSize(laptop.screen_size);
      
      // Check if any selected screen size matches
      const matchesScreenSize = Array.from(filters.screenSizes).some(selectedSize => {
        const selectedScreenSize = parseScreenSize(selectedSize);
        // Allow values that are very close (accounts for "15.6" vs "15.6 inches")
        return Math.abs(laptopScreenSize - selectedScreenSize) < 0.1;
      });
      
      if (!matchesScreenSize) {
        filterReasons.push(`Screen size mismatch: ${laptop.screen_size} (${laptopScreenSize}")`);
        return false;
      }
    }

    // This laptop passed all filters
    return true;
  });

  console.log(`Filtering complete: ${filteredLaptops.length} out of ${laptops.length} laptops matched filters`);
  
  // Log a sample of filtered laptops for debugging
  if (filteredLaptops.length > 0) {
    console.log('Sample of matching laptops:', filteredLaptops.slice(0, 3).map(l => ({
      title: l.title,
      price: l.current_price,
      ram: l.ram,
      storage: l.storage,
      processor: l.processor
    })));
  }
  
  return filteredLaptops;
};



import type { Product } from "@/types/product";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";
import { KNOWN_BRANDS } from "@/utils/laptop/hardwareScoring";

// Helper parsing functions for consistent value extraction
const parseRamValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)\s*(GB|TB|MB|gb|tb|mb)/i);
  if (!match) return 0;
  
  const [, amount, , unit] = match;
  const numValue = parseFloat(amount);
  
  switch (unit.toLowerCase()) {
    case 'tb': return numValue * 1024;
    case 'mb': return numValue / 1024;
    case 'gb': return numValue;
    default: return 0;
  }
};

const parseStorageValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const match = value.match(/(\d+(\.\d+)?)\s*(GB|TB|MB|gb|tb|mb)/i);
  if (!match) return 0;
  
  const [, amount, , unit] = match;
  const numValue = parseFloat(amount);
  
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

/**
 * Check if a filter value matches a product value with fuzzy matching for various formats
 */
const matchesFilter = (
  filterValue: string,
  productValue: string | null | undefined,
  filterType: 'processor' | 'ram' | 'storage' | 'graphics' | 'screen_size' | 'brand'
): boolean => {
  if (!productValue) return false;
  
  const productLower = productValue.toLowerCase();
  const filterLower = filterValue.toLowerCase();
  
  switch (filterType) {
    case 'ram': {
      const productRamGB = parseRamValue(productValue);
      const filterRamGB = parseRamValue(filterValue);
      return Math.abs(productRamGB - filterRamGB) < 0.5;
    }
    
    case 'storage': {
      const productStorageGB = parseStorageValue(productValue);
      const filterStorageGB = parseStorageValue(filterValue);
      return Math.abs(productStorageGB - filterStorageGB) < 0.5;
    }
    
    case 'screen_size': {
      const productSize = parseScreenSize(productValue);
      const filterSize = parseScreenSize(filterValue);
      return Math.abs(productSize - filterSize) < 0.1;
    }
    
    case 'processor': {
      // Match processor by key components
      if ((filterLower.includes('i3') || filterLower.includes('i5') || 
           filterLower.includes('i7') || filterLower.includes('i9')) &&
          (productLower.includes('i3') || productLower.includes('i5') || 
           productLower.includes('i7') || productLower.includes('i9'))) {
        
        const filterMatch = filterLower.match(/i([3579])/);
        const productMatch = productLower.match(/i([3579])/);
        
        if (filterMatch && productMatch && filterMatch[1] === productMatch[1]) {
          const filterGen = filterLower.match(/(\d+)(st|nd|rd|th)?\s+gen/);
          const productGen = productLower.match(/(\d+)(st|nd|rd|th)?\s+gen/);
          
          if (filterGen && productGen) {
            return filterGen[1] === productGen[1];
          }
          return true;
        }
        return false;
      }
      
      // Apple M-series pattern
      if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
          (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
        return (filterLower.includes('m1') && productLower.includes('m1')) ||
               (filterLower.includes('m2') && productLower.includes('m2')) ||
               (filterLower.includes('m3') && productLower.includes('m3'));
      }
      
      // AMD Ryzen pattern
      if (filterLower.includes('ryzen') && productLower.includes('ryzen')) {
        const filterMatch = filterLower.match(/ryzen\s+([3579])/);
        const productMatch = productLower.match(/ryzen\s+([3579])/);
        
        if (filterMatch && productMatch) {
          return filterMatch[1] === productMatch[1];
        }
      }
      
      return productLower.includes(filterLower);
    }
    
    case 'graphics': {
      // NVIDIA GPUs
      if ((filterLower.includes('rtx') || filterLower.includes('gtx')) &&
          (productLower.includes('rtx') || productLower.includes('gtx'))) {
          
        const filterIsRTX = filterLower.includes('rtx');
        const productIsRTX = productLower.includes('rtx');
        
        if (filterIsRTX !== productIsRTX) {
          return false;
        }
        
        const filterSeries = filterLower.match(/(?:rtx|gtx)\s*(\d)/i);
        const productSeries = productLower.match(/(?:rtx|gtx)\s*(\d)/i);
        
        if (filterSeries && productSeries) {
          return filterSeries[1] === productSeries[1];
        }
      }
      
      // Intel graphics
      if (filterLower.includes('intel') && productLower.includes('intel')) {
        const types = ['iris', 'uhd', 'hd'];
        return types.some(type => 
          filterLower.includes(type) === productLower.includes(type)
        );
      }
      
      // AMD graphics
      if (filterLower.includes('radeon') && productLower.includes('radeon')) {
        const filterHasRX = filterLower.includes('rx');
        const productHasRX = productLower.includes('rx');
        
        if (filterHasRX && productHasRX) {
          const filterSeries = filterLower.match(/rx\s*(\d)/i);
          const productSeries = productLower.match(/rx\s*(\d)/i);
          
          if (filterSeries && productSeries) {
            return filterSeries[1] === productSeries[1];
          }
          return true;
        }
        return !filterHasRX && !productHasRX;
      }
      
      // Apple GPUs
      if ((filterLower.includes('m1') || filterLower.includes('m2') || filterLower.includes('m3')) &&
          (productLower.includes('m1') || productLower.includes('m2') || productLower.includes('m3'))) {
        return (filterLower.includes('m1') && productLower.includes('m1')) ||
               (filterLower.includes('m2') && productLower.includes('m2')) ||
               (filterLower.includes('m3') && productLower.includes('m3'));
      }
      
      return productLower.includes(filterLower);
    }
    
    case 'brand': {
      const normalizedProduct = productLower.trim();
      const normalizedFilter = filterLower.trim();
      return normalizedProduct === normalizedFilter;
    }
    
    default:
      return productLower.includes(filterLower);
  }
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

  // Create a lookup of properly capitalized brand names
  const brandMap: {[key: string]: string} = {};
  Object.entries(KNOWN_BRANDS).forEach(([key, value]) => {
    brandMap[key] = value;
  });

  const getProperBrand = (brand: string): string => {
    if (!brand) return '';
    const lowerBrand = brand.toLowerCase().trim();
    return brandMap[lowerBrand] || brand;
  };

  const filteredLaptops = laptops.filter(laptop => {
    const brandNormalized = laptop.brand ? getProperBrand(laptop.brand) : '';
    const filterReasons: string[] = [];
    
    // Price Range Filter
    const price = laptop.current_price || 0;
    if (price < filters.priceRange.min || price > filters.priceRange.max) {
      filterReasons.push(`Price out of range: ${price}`);
      return false;
    }

    // Brand Filter
    if (filters.brands.size > 0) {
      const matchesBrand = Array.from(filters.brands).some(selectedBrand => 
        brandNormalized.toLowerCase() === selectedBrand.toLowerCase()
      );
      
      if (!matchesBrand) {
        filterReasons.push(`Brand mismatch: ${brandNormalized}`);
        return false;
      }
    }

    // Processor Filter
    if (filters.processors.size > 0 && laptop.processor) {
      const matchesProcessor = Array.from(filters.processors).some(selectedProcessor => 
        matchesFilter(selectedProcessor, laptop.processor, 'processor')
      );
      
      if (!matchesProcessor) {
        filterReasons.push(`Processor mismatch: ${laptop.processor}`);
        return false;
      }
    }

    // RAM Filter
    if (filters.ramSizes.size > 0 && laptop.ram) {
      const matchesRam = Array.from(filters.ramSizes).some(selectedRam => 
        matchesFilter(selectedRam, laptop.ram, 'ram')
      );
      
      if (!matchesRam) {
        filterReasons.push(`RAM mismatch: ${laptop.ram}`);
        return false;
      }
    }

    // Storage Filter
    if (filters.storageOptions.size > 0 && laptop.storage) {
      const matchesStorage = Array.from(filters.storageOptions).some(selectedStorage => 
        matchesFilter(selectedStorage, laptop.storage, 'storage')
      );
      
      if (!matchesStorage) {
        filterReasons.push(`Storage mismatch: ${laptop.storage}`);
        return false;
      }
    }

    // Graphics Filter
    if (filters.graphicsCards.size > 0 && laptop.graphics) {
      const matchesGraphics = Array.from(filters.graphicsCards).some(selectedGraphics => 
        matchesFilter(selectedGraphics, laptop.graphics, 'graphics')
      );
      
      if (!matchesGraphics) {
        filterReasons.push(`Graphics mismatch: ${laptop.graphics}`);
        return false;
      }
    }

    // Screen Size Filter
    if (filters.screenSizes.size > 0 && laptop.screen_size) {
      const matchesScreenSize = Array.from(filters.screenSizes).some(selectedSize => 
        matchesFilter(selectedSize, laptop.screen_size, 'screen_size')
      );
      
      if (!matchesScreenSize) {
        filterReasons.push(`Screen size mismatch: ${laptop.screen_size}`);
        return false;
      }
    }

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

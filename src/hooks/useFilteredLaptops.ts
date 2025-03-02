
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { Product } from '@/types/product';
import type { FilterOptions } from '@/components/laptops/LaptopFilters';
import { matchesStorageFilter } from '@/utils/laptop/filter/matchers/storageMatcher';
import { matchesRamFilter } from '@/utils/laptop/filter/matchers/ramMatcher';
import { matchesScreenSizeFilter } from '@/utils/laptop/filter/matchers/screenSizeMatcher';
import { matchesIntelProcessor } from '@/utils/laptop/filter/matchers/processor/intel/intelCore';
import { matchesOtherProcessor } from '@/utils/laptop/filter/matchers/processor/otherProcessor';

/**
 * Enhanced hook for filtering laptops with React Query integration
 * @param laptops The array of laptops to filter
 * @param initialFilters Initial filter state
 * @param debounceMs Debounce time in milliseconds
 */
export function useFilteredLaptops(
  laptops: Product[],
  initialFilters: FilterOptions,
  debounceMs: number = 300
) {
  // Use the passed filters directly instead of maintaining internal state
  // This works better with React Query's caching
  
  // Debounce filter changes to prevent too many recalculations
  const debouncedFilters = useDebounce(initialFilters, debounceMs);

  // Memoize the filtered results to avoid recalculation if nothing has changed
  const filteredLaptops = useMemo(() => {
    console.log('Recalculating filtered laptops with', laptops.length, 'laptops');
    
    // Check if any filters are active
    const hasPriceFilter = debouncedFilters.priceRange.min > 0 || debouncedFilters.priceRange.max < 10000;
    const hasProcessorFilter = debouncedFilters.processors.size > 0;
    const hasRamFilter = debouncedFilters.ramSizes.size > 0;
    const hasStorageFilter = debouncedFilters.storageOptions.size > 0;
    const hasGraphicsFilter = debouncedFilters.graphicsCards.size > 0;
    const hasScreenSizeFilter = debouncedFilters.screenSizes.size > 0;
    const hasBrandFilter = debouncedFilters.brands.size > 0;
    
    // If no filters are active, return all laptops
    if (!hasPriceFilter && !hasProcessorFilter && !hasRamFilter && 
        !hasStorageFilter && !hasGraphicsFilter && !hasScreenSizeFilter && 
        !hasBrandFilter) {
      return laptops;
    }
    
    return laptops.filter(laptop => {
      // Price Filter
      if (hasPriceFilter) {
        const price = laptop.current_price || 0;
        if (price < debouncedFilters.priceRange.min || price > debouncedFilters.priceRange.max) {
          return false;
        }
      }
      
      // Brand Filter
      if (hasBrandFilter && laptop.brand) {
        const matchesBrand = Array.from(debouncedFilters.brands).some(
          brand => laptop.brand.toLowerCase() === brand.toLowerCase()
        );
        if (!matchesBrand) return false;
      }
      
      // Processor Filter
      if (hasProcessorFilter && laptop.processor) {
        const matchesProcessor = Array.from(debouncedFilters.processors).some(
          processor => {
            // Check for Intel processors
            if (processor.includes('Intel Core')) {
              return matchesIntelProcessor(processor, laptop.processor, laptop.title);
            }
            // Check for "Other Processor" category
            if (processor === 'Other Processor') {
              return matchesOtherProcessor(laptop.processor, laptop.title);
            }
            // Basic matching for other processors
            return laptop.processor.toLowerCase().includes(processor.toLowerCase());
          }
        );
        if (!matchesProcessor) return false;
      }
      
      // RAM Filter
      if (hasRamFilter && laptop.ram) {
        const matchesRam = Array.from(debouncedFilters.ramSizes).some(
          ram => matchesRamFilter(ram, laptop.ram, laptop.title)
        );
        if (!matchesRam) return false;
      }
      
      // Storage Filter
      if (hasStorageFilter && laptop.storage) {
        const matchesStorage = Array.from(debouncedFilters.storageOptions).some(
          storage => matchesStorageFilter(storage, laptop.storage, laptop.title)
        );
        if (!matchesStorage) return false;
      }
      
      // Graphics Card Filter
      if (hasGraphicsFilter && laptop.graphics) {
        const matchesGraphics = Array.from(debouncedFilters.graphicsCards).some(
          graphics => laptop.graphics?.toLowerCase().includes(graphics.toLowerCase())
        );
        if (!matchesGraphics) return false;
      }
      
      // Screen Size Filter
      if (hasScreenSizeFilter && laptop.screen_size) {
        const matchesScreenSize = Array.from(debouncedFilters.screenSizes).some(
          screenSize => matchesScreenSizeFilter(screenSize, laptop.screen_size, laptop.title)
        );
        if (!matchesScreenSize) return false;
      }
      
      return true;
    });
  }, [laptops, debouncedFilters]);

  // Memoize filter stats for UI indicators
  const filterStats = useMemo(() => {
    return {
      count: filteredLaptops.length,
      priceRange: filteredLaptops.length > 0 ? {
        min: Math.min(...filteredLaptops.map(l => l.current_price || Infinity).filter(p => p !== Infinity && !isNaN(p))),
        max: Math.max(...filteredLaptops.map(l => l.current_price || 0).filter(p => !isNaN(p)))
      } : { min: 0, max: 0 }
    };
  }, [filteredLaptops]);

  return {
    filteredLaptops,
    filterStats
  };
}


import { useMemo } from "react";
import type { Product } from "@/types/product";
import type { FilterOptions } from "../types";
import { matchesFilter } from "@/utils/laptop/filter/matchers";

/**
 * Hook to calculate which filter options should be disabled based on other selected filters
 */
export const useDisabledOptions = (
  filters: FilterOptions, 
  allLaptops: Product[],
  totalActiveFilters: number,
  processors: Set<string>,
  ramSizes: Set<string>,
  storageOptions: Set<string>,
  graphicsCards: Set<string>,
  screenSizes: Set<string>,
  brands: Set<string>
) => {
  return useMemo(() => {
    if (totalActiveFilters === 0 || allLaptops.length === 0) {
      return {
        brands: new Set<string>(),
        processors: new Set<string>(),
        ramSizes: new Set<string>(),
        storageOptions: new Set<string>(),
        graphicsCards: new Set<string>(),
        screenSizes: new Set<string>(),
      };
    }
    
    // For each filter category, find which options would have no matches
    const calculateDisabledOptionsForCategory = (category: keyof Omit<FilterOptions, 'priceRange'>) => {
      // Create a test filter set that includes all currently selected filters EXCEPT this category
      const testFilters = { ...filters };
      
      // Clear the current category we're testing to see which values would match
      if (category === 'brands') testFilters.brands = new Set<string>();
      else if (category === 'processors') testFilters.processors = new Set<string>();
      else if (category === 'ramSizes') testFilters.ramSizes = new Set<string>();
      else if (category === 'storageOptions') testFilters.storageOptions = new Set<string>();
      else if (category === 'graphicsCards') testFilters.graphicsCards = new Set<string>();
      else if (category === 'screenSizes') testFilters.screenSizes = new Set<string>();
      
      // Get all laptops that match the other selected filters
      const laptopsMatchingOtherFilters = allLaptops.filter(laptop => {
        // Price filter
        if (laptop.current_price < testFilters.priceRange.min || 
            laptop.current_price > testFilters.priceRange.max) {
          return false;
        }
        
        // Apply other filters
        if (testFilters.brands.size > 0 && 
            !Array.from(testFilters.brands).some(brand => 
              matchesFilter(brand, laptop.brand, 'brand', laptop.title))) {
          return false;
        }
        
        if (testFilters.processors.size > 0 && 
            !Array.from(testFilters.processors).some(processor => 
              matchesFilter(processor, laptop.processor, 'processor', laptop.title))) {
          return false;
        }
        
        if (testFilters.ramSizes.size > 0 && 
            !Array.from(testFilters.ramSizes).some(ram => 
              matchesFilter(ram, laptop.ram, 'ram', laptop.title))) {
          return false;
        }
        
        if (testFilters.storageOptions.size > 0 && 
            !Array.from(testFilters.storageOptions).some(storage => 
              matchesFilter(storage, laptop.storage, 'storage', laptop.title))) {
          return false;
        }
        
        if (testFilters.graphicsCards.size > 0 && 
            !Array.from(testFilters.graphicsCards).some(graphics => 
              matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title))) {
          return false;
        }
        
        if (testFilters.screenSizes.size > 0 && 
            !Array.from(testFilters.screenSizes).some(screenSize => 
              matchesFilter(screenSize, laptop.screen_size, 'screen_size', laptop.title))) {
          return false;
        }
        
        return true;
      });
      
      // For each option in this category, check if there's at least one laptop that would match
      const disabledOptions = new Set<string>();
      
      // Efficiently collect all available options that would have matches
      const availableOptions = new Set<string>();
      
      // For each laptop that matches other filters, collect which options in this category would work
      laptopsMatchingOtherFilters.forEach(laptop => {
        if (category === 'brands') {
          Array.from(brands).forEach(option => {
            if (matchesFilter(option, laptop.brand, 'brand', laptop.title)) {
              availableOptions.add(option);
            }
          });
        } 
        else if (category === 'processors') {
          Array.from(processors).forEach(option => {
            if (matchesFilter(option, laptop.processor, 'processor', laptop.title)) {
              availableOptions.add(option);
            }
          });
        }
        else if (category === 'ramSizes') {
          Array.from(ramSizes).forEach(option => {
            if (matchesFilter(option, laptop.ram, 'ram', laptop.title)) {
              availableOptions.add(option);
            }
          });
        }
        else if (category === 'storageOptions') {
          Array.from(storageOptions).forEach(option => {
            if (matchesFilter(option, laptop.storage, 'storage', laptop.title)) {
              availableOptions.add(option);
            }
          });
        }
        else if (category === 'graphicsCards') {
          Array.from(graphicsCards).forEach(option => {
            if (matchesFilter(option, laptop.graphics, 'graphics', laptop.title)) {
              availableOptions.add(option);
            }
          });
        }
        else if (category === 'screenSizes') {
          Array.from(screenSizes).forEach(option => {
            if (matchesFilter(option, laptop.screen_size, 'screen_size', laptop.title)) {
              availableOptions.add(option);
            }
          });
        }
      });
      
      // Now mark as disabled any option that's not in the available options
      if (category === 'brands') {
        Array.from(brands).forEach(option => {
          if (!availableOptions.has(option)) {
            disabledOptions.add(option);
          }
        });
      }
      else if (category === 'processors') {
        Array.from(processors).forEach(option => {
          if (!availableOptions.has(option)) {
            disabledOptions.add(option);
          }
        });
      }
      else if (category === 'ramSizes') {
        Array.from(ramSizes).forEach(option => {
          if (!availableOptions.has(option)) {
            disabledOptions.add(option);
          }
        });
      }
      else if (category === 'storageOptions') {
        Array.from(storageOptions).forEach(option => {
          if (!availableOptions.has(option)) {
            disabledOptions.add(option);
          }
        });
      }
      else if (category === 'graphicsCards') {
        Array.from(graphicsCards).forEach(option => {
          if (!availableOptions.has(option)) {
            disabledOptions.add(option);
          }
        });
      }
      else if (category === 'screenSizes') {
        Array.from(screenSizes).forEach(option => {
          if (!availableOptions.has(option)) {
            disabledOptions.add(option);
          }
        });
      }
      
      return disabledOptions;
    };
    
    return {
      brands: calculateDisabledOptionsForCategory('brands'),
      processors: calculateDisabledOptionsForCategory('processors'),
      ramSizes: calculateDisabledOptionsForCategory('ramSizes'),
      storageOptions: calculateDisabledOptionsForCategory('storageOptions'),
      graphicsCards: calculateDisabledOptionsForCategory('graphicsCards'),
      screenSizes: calculateDisabledOptionsForCategory('screenSizes'),
    };
  }, [allLaptops, filters, brands, processors, ramSizes, storageOptions, graphicsCards, screenSizes, totalActiveFilters]);
};

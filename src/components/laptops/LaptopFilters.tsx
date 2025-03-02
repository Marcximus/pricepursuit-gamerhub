
import { useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { FilterSection } from "./filters/FilterSection";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { matchesFilter } from "@/utils/laptop/filter/matchers";
import type { Product } from "@/types/product";

export type FilterOptions = {
  priceRange: { min: number; max: number };
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
  brands: Set<string>;
};

type LaptopFiltersProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
  brands: Set<string>;
  allLaptops?: Product[]; // Add access to all laptops for calculating availability
};

export function LaptopFilters({
  filters,
  onFiltersChange,
  processors,
  ramSizes,
  storageOptions,
  graphicsCards,
  screenSizes,
  brands,
  allLaptops = [],
}: LaptopFiltersProps) {
  // Handle price range changes
  const handlePriceChange = useCallback((min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: { min, max }
    });
  }, [filters, onFiltersChange]);

  // Handle filter changes for a specific category
  const handleFilterChange = useCallback((category: keyof Omit<FilterOptions, 'priceRange'>, newOptions: Set<string>) => {
    onFiltersChange({
      ...filters,
      [category]: newOptions
    });
  }, [filters, onFiltersChange]);

  // Count total active filters
  const totalActiveFilters = 
    (filters.priceRange.min > 0 || filters.priceRange.max < 10000 ? 1 : 0) +
    filters.brands.size + 
    filters.processors.size + 
    filters.ramSizes.size + 
    filters.storageOptions.size + 
    filters.graphicsCards.size + 
    filters.screenSizes.size;

  // Determine which filters have active selections for defaultExpanded
  const hasActiveBrandFilters = filters.brands.size > 0;
  const hasActiveProcessorFilters = filters.processors.size > 0; 
  const hasActiveRamFilters = filters.ramSizes.size > 0;
  const hasActiveStorageFilters = filters.storageOptions.size > 0;
  const hasActiveGraphicsFilters = filters.graphicsCards.size > 0;
  const hasActiveScreenSizeFilters = filters.screenSizes.size > 0;

  // Calculate which laptops pass the current filters
  const filteredLaptops = useMemo(() => {
    if (totalActiveFilters === 0) return allLaptops;
    
    return allLaptops.filter(laptop => {
      // Price filter
      const price = laptop.current_price;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }
      
      // Brand filter
      if (filters.brands.size > 0) {
        const brandMatches = Array.from(filters.brands).some(brand => 
          matchesFilter(brand, laptop.brand, 'brand', laptop.title)
        );
        if (!brandMatches) return false;
      }
      
      // Processor filter
      if (filters.processors.size > 0) {
        const processorMatches = Array.from(filters.processors).some(processor => 
          matchesFilter(processor, laptop.processor, 'processor', laptop.title)
        );
        if (!processorMatches) return false;
      }
      
      // RAM filter
      if (filters.ramSizes.size > 0) {
        const ramMatches = Array.from(filters.ramSizes).some(ram => 
          matchesFilter(ram, laptop.ram, 'ram', laptop.title)
        );
        if (!ramMatches) return false;
      }
      
      // Storage filter
      if (filters.storageOptions.size > 0) {
        const storageMatches = Array.from(filters.storageOptions).some(storage => 
          matchesFilter(storage, laptop.storage, 'storage', laptop.title)
        );
        if (!storageMatches) return false;
      }
      
      // Graphics filter
      if (filters.graphicsCards.size > 0) {
        const graphicsMatches = Array.from(filters.graphicsCards).some(graphics => 
          matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title)
        );
        if (!graphicsMatches) return false;
      }
      
      // Screen size filter
      if (filters.screenSizes.size > 0) {
        const screenSizeMatches = Array.from(filters.screenSizes).some(screenSize => 
          matchesFilter(screenSize, laptop.screen_size, 'screen_size', laptop.title)
        );
        if (!screenSizeMatches) return false;
      }
      
      return true;
    });
  }, [allLaptops, filters, totalActiveFilters]);

  // Calculate disabled options for each filter based on other active filters
  const disabledOptions = useMemo(() => {
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
    
    // Create a copy of the filters with each category removed one at a time
    // to check which options would still have matches if selected
    const getAvailableOptionsForCategory = (category: keyof Omit<FilterOptions, 'priceRange'>) => {
      // Create filters without the current category
      const filtersWithoutCategory = { 
        ...filters,
        [category]: new Set<string>() 
      };
      
      // Find laptops that match all other filters
      const laptopsMatchingOtherFilters = allLaptops.filter(laptop => {
        // Price filter
        const price = laptop.current_price;
        if (price < filtersWithoutCategory.priceRange.min || price > filtersWithoutCategory.priceRange.max) {
          return false;
        }
        
        // Brand filter
        if (filtersWithoutCategory.brands.size > 0 && category !== 'brands') {
          const brandMatches = Array.from(filtersWithoutCategory.brands).some(brand => 
            matchesFilter(brand, laptop.brand, 'brand', laptop.title)
          );
          if (!brandMatches) return false;
        }
        
        // Processor filter
        if (filtersWithoutCategory.processors.size > 0 && category !== 'processors') {
          const processorMatches = Array.from(filtersWithoutCategory.processors).some(processor => 
            matchesFilter(processor, laptop.processor, 'processor', laptop.title)
          );
          if (!processorMatches) return false;
        }
        
        // RAM filter
        if (filtersWithoutCategory.ramSizes.size > 0 && category !== 'ramSizes') {
          const ramMatches = Array.from(filtersWithoutCategory.ramSizes).some(ram => 
            matchesFilter(ram, laptop.ram, 'ram', laptop.title)
          );
          if (!ramMatches) return false;
        }
        
        // Storage filter
        if (filtersWithoutCategory.storageOptions.size > 0 && category !== 'storageOptions') {
          const storageMatches = Array.from(filtersWithoutCategory.storageOptions).some(storage => 
            matchesFilter(storage, laptop.storage, 'storage', laptop.title)
          );
          if (!storageMatches) return false;
        }
        
        // Graphics filter
        if (filtersWithoutCategory.graphicsCards.size > 0 && category !== 'graphicsCards') {
          const graphicsMatches = Array.from(filtersWithoutCategory.graphicsCards).some(graphics => 
            matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title)
          );
          if (!graphicsMatches) return false;
        }
        
        // Screen size filter
        if (filtersWithoutCategory.screenSizes.size > 0 && category !== 'screenSizes') {
          const screenSizeMatches = Array.from(filtersWithoutCategory.screenSizes).some(screenSize => 
            matchesFilter(screenSize, laptop.screen_size, 'screen_size', laptop.title)
          );
          if (!screenSizeMatches) return false;
        }
        
        return true;
      });
      
      // Calculate which options in this category have matching laptops
      const availableOptions = new Set<string>();
      
      if (category === 'brands') {
        laptopsMatchingOtherFilters.forEach(laptop => {
          Array.from(brands).forEach(brand => {
            if (matchesFilter(brand, laptop.brand, 'brand', laptop.title)) {
              availableOptions.add(brand);
            }
          });
        });
      } else if (category === 'processors') {
        laptopsMatchingOtherFilters.forEach(laptop => {
          Array.from(processors).forEach(processor => {
            if (matchesFilter(processor, laptop.processor, 'processor', laptop.title)) {
              availableOptions.add(processor);
            }
          });
        });
      } else if (category === 'ramSizes') {
        laptopsMatchingOtherFilters.forEach(laptop => {
          Array.from(ramSizes).forEach(ram => {
            if (matchesFilter(ram, laptop.ram, 'ram', laptop.title)) {
              availableOptions.add(ram);
            }
          });
        });
      } else if (category === 'storageOptions') {
        laptopsMatchingOtherFilters.forEach(laptop => {
          Array.from(storageOptions).forEach(storage => {
            if (matchesFilter(storage, laptop.storage, 'storage', laptop.title)) {
              availableOptions.add(storage);
            }
          });
        });
      } else if (category === 'graphicsCards') {
        laptopsMatchingOtherFilters.forEach(laptop => {
          Array.from(graphicsCards).forEach(graphics => {
            if (matchesFilter(graphics, laptop.graphics, 'graphics', laptop.title)) {
              availableOptions.add(graphics);
            }
          });
        });
      } else if (category === 'screenSizes') {
        laptopsMatchingOtherFilters.forEach(laptop => {
          Array.from(screenSizes).forEach(screenSize => {
            if (matchesFilter(screenSize, laptop.screen_size, 'screen_size', laptop.title)) {
              availableOptions.add(screenSize);
            }
          });
        });
      }
      
      // Calculate which options should be disabled
      const disabledOptions = new Set<string>();
      
      if (category === 'brands') {
        Array.from(brands).forEach(option => {
          if (!availableOptions.has(option)) disabledOptions.add(option);
        });
      } else if (category === 'processors') {
        Array.from(processors).forEach(option => {
          if (!availableOptions.has(option)) disabledOptions.add(option);
        });
      } else if (category === 'ramSizes') {
        Array.from(ramSizes).forEach(option => {
          if (!availableOptions.has(option)) disabledOptions.add(option);
        });
      } else if (category === 'storageOptions') {
        Array.from(storageOptions).forEach(option => {
          if (!availableOptions.has(option)) disabledOptions.add(option);
        });
      } else if (category === 'graphicsCards') {
        Array.from(graphicsCards).forEach(option => {
          if (!availableOptions.has(option)) disabledOptions.add(option);
        });
      } else if (category === 'screenSizes') {
        Array.from(screenSizes).forEach(option => {
          if (!availableOptions.has(option)) disabledOptions.add(option);
        });
      }
      
      return disabledOptions;
    };
    
    return {
      brands: getAvailableOptionsForCategory('brands'),
      processors: getAvailableOptionsForCategory('processors'),
      ramSizes: getAvailableOptionsForCategory('ramSizes'),
      storageOptions: getAvailableOptionsForCategory('storageOptions'),
      graphicsCards: getAvailableOptionsForCategory('graphicsCards'),
      screenSizes: getAvailableOptionsForCategory('screenSizes'),
    };
  }, [allLaptops, filters, totalActiveFilters, brands, processors, ramSizes, storageOptions, graphicsCards, screenSizes]);

  // User-focused ordering of filter sections
  const filterSections = [
    { id: "Brand", hasActiveFilters: hasActiveBrandFilters },
    { id: "Processor", hasActiveFilters: hasActiveProcessorFilters },
    { id: "RAM", hasActiveFilters: hasActiveRamFilters },
    { id: "Storage", hasActiveFilters: hasActiveStorageFilters },
    { id: "Graphics", hasActiveFilters: hasActiveGraphicsFilters },
    { id: "Screen Size", hasActiveFilters: hasActiveScreenSizeFilters }
  ];

  // Set which sections should be expanded by default
  const defaultValues = filterSections
    .filter(section => section.hasActiveFilters)
    .map(section => section.id);

  // Ensure at least the first filter (Brand) is expanded by default if no filters are active
  if (defaultValues.length === 0) {
    defaultValues.push("Brand");
  }

  // Reset all filters
  const handleResetAllFilters = () => {
    onFiltersChange({
      priceRange: { min: 0, max: 10000 },
      processors: new Set<string>(),
      ramSizes: new Set<string>(),
      storageOptions: new Set<string>(),
      graphicsCards: new Set<string>(),
      screenSizes: new Set<string>(),
      brands: new Set<string>(),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
            <p className="text-xs text-slate-500">Refine your search</p>
          </div>
        </div>
        {totalActiveFilters > 0 && (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-medium rounded-full h-6 min-w-[24px] px-1.5 mr-2">
              {totalActiveFilters}
            </span>
            <button
              onClick={handleResetAllFilters}
              className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              Reset all
            </button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-5">
          <PriceRangeFilter 
            minPrice={filters.priceRange.min}
            maxPrice={filters.priceRange.max}
            onPriceChange={handlePriceChange}
          />

          <Accordion type="multiple" defaultValue={defaultValues} className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <FilterSection
              title="Brand"
              options={brands}
              selectedOptions={filters.brands}
              onChange={(newBrands) => handleFilterChange('brands', newBrands)}
              defaultExpanded={hasActiveBrandFilters || defaultValues.includes("Brand")}
              icon="brand"
              disabledOptions={disabledOptions.brands}
            />
            <FilterSection
              title="Processor"
              options={processors}
              selectedOptions={filters.processors}
              onChange={(newProcessors) => handleFilterChange('processors', newProcessors)}
              defaultExpanded={hasActiveProcessorFilters}
              icon="cpu"
              disabledOptions={disabledOptions.processors}
            />
            <FilterSection
              title="RAM"
              options={ramSizes}
              selectedOptions={filters.ramSizes}
              onChange={(newRamSizes) => handleFilterChange('ramSizes', newRamSizes)}
              defaultExpanded={hasActiveRamFilters}
              icon="memory"
              disabledOptions={disabledOptions.ramSizes}
            />
            <FilterSection
              title="Storage"
              options={storageOptions}
              selectedOptions={filters.storageOptions}
              onChange={(newStorageOptions) => handleFilterChange('storageOptions', newStorageOptions)}
              defaultExpanded={hasActiveStorageFilters}
              icon="hard-drive"
              disabledOptions={disabledOptions.storageOptions}
            />
            <FilterSection
              title="Graphics"
              options={graphicsCards}
              selectedOptions={filters.graphicsCards}
              onChange={(newGraphicsCards) => handleFilterChange('graphicsCards', newGraphicsCards)}
              defaultExpanded={hasActiveGraphicsFilters}
              icon="gpu"
              disabledOptions={disabledOptions.graphicsCards}
            />
            <FilterSection
              title="Screen Size"
              options={screenSizes}
              selectedOptions={filters.screenSizes}
              onChange={(newScreenSizes) => handleFilterChange('screenSizes', newScreenSizes)}
              defaultExpanded={hasActiveScreenSizeFilters}
              icon="monitor"
              disabledOptions={disabledOptions.screenSizes}
            />
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

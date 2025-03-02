
import { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { FilterSection } from "./filters/FilterSection";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { FiltersHeader } from "./filters/components/FiltersHeader";
import type { Product } from "@/types/product";
import type { FilterOptions, FilterCategoryKey } from "./filters/types";
import { useDisabledOptions, useFilterSections, useTotalActiveFilters } from "./filters/hooks";

export type { FilterOptions } from "./filters/types";

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
  const handleFilterChange = useCallback((category: FilterCategoryKey, newOptions: Set<string>) => {
    onFiltersChange({
      ...filters,
      [category]: newOptions
    });
  }, [filters, onFiltersChange]);

  // Count total active filters
  const totalActiveFilters = useTotalActiveFilters(filters);

  // Determine which filters have active selections for defaultExpanded
  const hasActiveBrandFilters = filters.brands.size > 0;
  const hasActiveProcessorFilters = filters.processors.size > 0; 
  const hasActiveRamFilters = filters.ramSizes.size > 0;
  const hasActiveStorageFilters = filters.storageOptions.size > 0;
  const hasActiveGraphicsFilters = filters.graphicsCards.size > 0;
  const hasActiveScreenSizeFilters = filters.screenSizes.size > 0;

  // Get filter sections information for the accordion
  const { filterSections, defaultValues } = useFilterSections(
    hasActiveBrandFilters,
    hasActiveProcessorFilters,
    hasActiveRamFilters,
    hasActiveStorageFilters,
    hasActiveGraphicsFilters,
    hasActiveScreenSizeFilters
  );

  // Calculate which options should be disabled for each filter based on other active filters
  const disabledOptions = useDisabledOptions(
    filters,
    allLaptops,
    totalActiveFilters,
    processors,
    ramSizes,
    storageOptions,
    graphicsCards,
    screenSizes,
    brands
  );

  // Reset all filters
  const handleResetAllFilters = useCallback(() => {
    onFiltersChange({
      priceRange: { min: 0, max: 10000 },
      processors: new Set<string>(),
      ramSizes: new Set<string>(),
      storageOptions: new Set<string>(),
      graphicsCards: new Set<string>(),
      screenSizes: new Set<string>(),
      brands: new Set<string>(),
    });
  }, [onFiltersChange]);

  return (
    <div className="flex flex-col h-full">
      <FiltersHeader 
        totalActiveFilters={totalActiveFilters} 
        onResetAllFilters={handleResetAllFilters} 
      />

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

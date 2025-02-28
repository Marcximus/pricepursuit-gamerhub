
import { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { FilterSection } from "./filters/FilterSection";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";

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

  // Determine which filters have active selections for defaultExpanded
  const hasActiveBrandFilters = filters.brands.size > 0;
  const hasActiveProcessorFilters = filters.processors.size > 0; 
  const hasActiveRamFilters = filters.ramSizes.size > 0;
  const hasActiveStorageFilters = filters.storageOptions.size > 0;
  const hasActiveGraphicsFilters = filters.graphicsCards.size > 0;
  const hasActiveScreenSizeFilters = filters.screenSizes.size > 0;

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

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      <div className="space-y-6">
        <PriceRangeFilter 
          minPrice={filters.priceRange.min}
          maxPrice={filters.priceRange.max}
          onPriceChange={handlePriceChange}
        />

        <Accordion type="multiple" defaultValue={defaultValues} className="w-full">
          <FilterSection
            title="Brand"
            options={brands}
            selectedOptions={filters.brands}
            onChange={(newBrands) => handleFilterChange('brands', newBrands)}
            defaultExpanded={hasActiveBrandFilters || defaultValues.includes("Brand")}
          />
          <FilterSection
            title="Processor"
            options={processors}
            selectedOptions={filters.processors}
            onChange={(newProcessors) => handleFilterChange('processors', newProcessors)}
            defaultExpanded={hasActiveProcessorFilters}
          />
          <FilterSection
            title="RAM"
            options={ramSizes}
            selectedOptions={filters.ramSizes}
            onChange={(newRamSizes) => handleFilterChange('ramSizes', newRamSizes)}
            defaultExpanded={hasActiveRamFilters}
          />
          <FilterSection
            title="Storage"
            options={storageOptions}
            selectedOptions={filters.storageOptions}
            onChange={(newStorageOptions) => handleFilterChange('storageOptions', newStorageOptions)}
            defaultExpanded={hasActiveStorageFilters}
          />
          <FilterSection
            title="Graphics"
            options={graphicsCards}
            selectedOptions={filters.graphicsCards}
            onChange={(newGraphicsCards) => handleFilterChange('graphicsCards', newGraphicsCards)}
            defaultExpanded={hasActiveGraphicsFilters}
          />
          <FilterSection
            title="Screen Size"
            options={screenSizes}
            selectedOptions={filters.screenSizes}
            onChange={(newScreenSizes) => handleFilterChange('screenSizes', newScreenSizes)}
            defaultExpanded={hasActiveScreenSizeFilters}
          />
        </Accordion>
      </div>
    </ScrollArea>
  );
}

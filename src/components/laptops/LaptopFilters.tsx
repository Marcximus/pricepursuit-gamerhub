
import { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { FilterSection } from "./filters/FilterSection";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { SlidersHorizontal, X } from "lucide-react";

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
      <div className="flex items-center justify-between mb-3 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
        </div>
        {totalActiveFilters > 0 && (
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-medium rounded-full h-5 min-w-[20px] px-1.5 mr-1.5">
              {totalActiveFilters}
            </span>
            <button
              onClick={handleResetAllFilters}
              className="text-xs flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium transition-colors"
            >
              <X className="h-3 w-3" />
              Reset
            </button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 pb-4 max-h-[calc(100vh-220px)]">
        <div className="space-y-3">
          <PriceRangeFilter 
            minPrice={filters.priceRange.min}
            maxPrice={filters.priceRange.max}
            onPriceChange={handlePriceChange}
          />

          <Accordion 
            type="multiple" 
            defaultValue={defaultValues} 
            className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
            collapsible
          >
            <FilterSection
              title="Brand"
              options={brands}
              selectedOptions={filters.brands}
              onChange={(newBrands) => handleFilterChange('brands', newBrands)}
              defaultExpanded={hasActiveBrandFilters || defaultValues.includes("Brand")}
              icon="brand"
            />
            <FilterSection
              title="Processor"
              options={processors}
              selectedOptions={filters.processors}
              onChange={(newProcessors) => handleFilterChange('processors', newProcessors)}
              defaultExpanded={hasActiveProcessorFilters}
              icon="cpu"
            />
            <FilterSection
              title="RAM"
              options={ramSizes}
              selectedOptions={filters.ramSizes}
              onChange={(newRamSizes) => handleFilterChange('ramSizes', newRamSizes)}
              defaultExpanded={hasActiveRamFilters}
              icon="memory"
            />
            <FilterSection
              title="Storage"
              options={storageOptions}
              selectedOptions={filters.storageOptions}
              onChange={(newStorageOptions) => handleFilterChange('storageOptions', newStorageOptions)}
              defaultExpanded={hasActiveStorageFilters}
              icon="hard-drive"
            />
            <FilterSection
              title="Graphics"
              options={graphicsCards}
              selectedOptions={filters.graphicsCards}
              onChange={(newGraphicsCards) => handleFilterChange('graphicsCards', newGraphicsCards)}
              defaultExpanded={hasActiveGraphicsFilters}
              icon="gpu"
            />
            <FilterSection
              title="Screen Size"
              options={screenSizes}
              selectedOptions={filters.screenSizes}
              onChange={(newScreenSizes) => handleFilterChange('screenSizes', newScreenSizes)}
              defaultExpanded={hasActiveScreenSizeFilters}
              icon="monitor"
            />
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}

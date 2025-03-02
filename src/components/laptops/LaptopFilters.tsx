
import { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import { FilterSection } from "./filters/FilterSection";
import { PriceRangeFilter } from "./filters/PriceRangeFilter";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { SearchBar } from "./components/SearchBar";

export type FilterOptions = {
  priceRange: { min: number; max: number };
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
  brands: Set<string>;
  searchQuery?: string;
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
  const handleFilterChange = useCallback((category: keyof Omit<FilterOptions, 'priceRange' | 'searchQuery'>, newOptions: Set<string>) => {
    onFiltersChange({
      ...filters,
      [category]: newOptions
    });
  }, [filters, onFiltersChange]);

  // Handle search query changes
  const handleSearch = useCallback((query: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: query
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
    filters.screenSizes.size +
    (filters.searchQuery && filters.searchQuery.trim() !== "" ? 1 : 0);

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
      searchQuery: ""
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b border-slate-200">
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Search laptops by name, specs..."
        />
        
        {totalActiveFilters > 0 && (
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-slate-500">
              {totalActiveFilters} active {totalActiveFilters === 1 ? 'filter' : 'filters'}
            </div>
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
        <div className="space-y-5 pt-4">
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

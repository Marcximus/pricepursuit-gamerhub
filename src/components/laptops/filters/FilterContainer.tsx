
import React, { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { FilterHeader } from "./FilterHeader";
import { FilterAccordion } from "./FilterAccordion";
import type { FilterOptions } from "@/components/laptops/LaptopFilters";

type FilterContainerProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
  brands: Set<string>;
};

export function FilterContainer({
  filters,
  onFiltersChange,
  processors,
  ramSizes,
  storageOptions,
  graphicsCards,
  screenSizes,
  brands,
}: FilterContainerProps) {
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

  // Determine which filters have active selections for defaultExpanded
  const filterSections = [
    { id: "Brand", hasActiveFilters: filters.brands.size > 0 },
    { id: "Processor", hasActiveFilters: filters.processors.size > 0 },
    { id: "RAM", hasActiveFilters: filters.ramSizes.size > 0 },
    { id: "Storage", hasActiveFilters: filters.storageOptions.size > 0 },
    { id: "Graphics", hasActiveFilters: filters.graphicsCards.size > 0 },
    { id: "Screen Size", hasActiveFilters: filters.screenSizes.size > 0 }
  ];

  // Set which sections should be expanded by default
  const defaultValues = filterSections
    .filter(section => section.hasActiveFilters)
    .map(section => section.id);

  // Ensure at least the first filter (Brand) is expanded by default if no filters are active
  if (defaultValues.length === 0) {
    defaultValues.push("Brand");
  }

  const filterOptions = {
    brands,
    processors,
    ramSizes,
    storageOptions,
    graphicsCards,
    screenSizes
  };

  return (
    <div className="flex flex-col h-full">
      <FilterHeader 
        onSearch={handleSearch}
      />

      <ScrollArea className="flex-1 px-4 pb-4">
        <div className="space-y-5 pt-4">
          <PriceRangeFilter 
            minPrice={filters.priceRange.min}
            maxPrice={filters.priceRange.max}
            onPriceChange={handlePriceChange}
          />

          <FilterAccordion 
            filterSections={filterSections}
            defaultValues={defaultValues}
            filters={filters}
            handleFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

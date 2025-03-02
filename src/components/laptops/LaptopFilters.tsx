
import React from "react";
import { FilterContainer } from "./filters/FilterContainer";

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
  return (
    <FilterContainer
      filters={filters}
      onFiltersChange={onFiltersChange}
      processors={processors}
      ramSizes={ramSizes}
      storageOptions={storageOptions}
      graphicsCards={graphicsCards}
      screenSizes={screenSizes}
      brands={brands}
    />
  );
}

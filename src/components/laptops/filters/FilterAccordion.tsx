
import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { FilterSection } from "./FilterSection";

type FilterAccordionProps = {
  filterSections: Array<{ id: string; hasActiveFilters: boolean }>;
  defaultValues: string[];
  filters: {
    brands: Set<string>;
    processors: Set<string>;
    ramSizes: Set<string>;
    storageOptions: Set<string>;
    graphicsCards: Set<string>;
    screenSizes: Set<string>;
  };
  handleFilterChange: (category: string, newOptions: Set<string>) => void;
  filterOptions: {
    brands: Set<string>;
    processors: Set<string>;
    ramSizes: Set<string>;
    storageOptions: Set<string>;
    graphicsCards: Set<string>;
    screenSizes: Set<string>;
  };
};

export function FilterAccordion({ 
  filterSections, 
  defaultValues, 
  filters, 
  handleFilterChange,
  filterOptions
}: FilterAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={defaultValues} className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <FilterSection
        title="Brand"
        options={filterOptions.brands}
        selectedOptions={filters.brands}
        onChange={(newBrands) => handleFilterChange('brands', newBrands)}
        defaultExpanded={filterSections.find(s => s.id === "Brand")?.hasActiveFilters || defaultValues.includes("Brand")}
        icon="brand"
      />
      <FilterSection
        title="Processor"
        options={filterOptions.processors}
        selectedOptions={filters.processors}
        onChange={(newProcessors) => handleFilterChange('processors', newProcessors)}
        defaultExpanded={filterSections.find(s => s.id === "Processor")?.hasActiveFilters}
        icon="cpu"
      />
      <FilterSection
        title="RAM"
        options={filterOptions.ramSizes}
        selectedOptions={filters.ramSizes}
        onChange={(newRamSizes) => handleFilterChange('ramSizes', newRamSizes)}
        defaultExpanded={filterSections.find(s => s.id === "RAM")?.hasActiveFilters}
        icon="memory"
      />
      <FilterSection
        title="Storage"
        options={filterOptions.storageOptions}
        selectedOptions={filters.storageOptions}
        onChange={(newStorageOptions) => handleFilterChange('storageOptions', newStorageOptions)}
        defaultExpanded={filterSections.find(s => s.id === "Storage")?.hasActiveFilters}
        icon="hard-drive"
      />
      <FilterSection
        title="Graphics"
        options={filterOptions.graphicsCards}
        selectedOptions={filters.graphicsCards}
        onChange={(newGraphicsCards) => handleFilterChange('graphicsCards', newGraphicsCards)}
        defaultExpanded={filterSections.find(s => s.id === "Graphics")?.hasActiveFilters}
        icon="gpu"
      />
      <FilterSection
        title="Screen Size"
        options={filterOptions.screenSizes}
        selectedOptions={filters.screenSizes}
        onChange={(newScreenSizes) => handleFilterChange('screenSizes', newScreenSizes)}
        defaultExpanded={filterSections.find(s => s.id === "Screen Size")?.hasActiveFilters}
        icon="monitor"
      />
    </Accordion>
  );
}


import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

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

type FilterSectionProps = {
  title: string;
  options: Set<string>;
  selectedOptions: Set<string>;
  onChange: (options: Set<string>) => void;
  defaultExpanded?: boolean;
};

const FilterSection = ({ 
  title, 
  options, 
  selectedOptions, 
  onChange,
  defaultExpanded = false
}: FilterSectionProps) => {
  const optionsArray = Array.from(options);
  const hasSelections = selectedOptions.size > 0;

  const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
    const newSelected = new Set(selectedOptions);
    if (checked) {
      newSelected.add(option);
    } else {
      newSelected.delete(option);
    }
    onChange(newSelected);
  }, [selectedOptions, onChange]);

  const handleClearFilter = useCallback(() => {
    onChange(new Set());
  }, [onChange]);

  return (
    <AccordionItem value={title} className="border-b">
      <AccordionTrigger className="text-sm font-medium hover:no-underline flex justify-between items-center">
        <div className="flex items-center gap-2">
          {title}
          {hasSelections && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {selectedOptions.size}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {hasSelections && (
          <div className="mb-2 flex justify-end">
            <button 
              onClick={handleClearFilter}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear selections
            </button>
          </div>
        )}
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4 space-y-2">
            {optionsArray.length > 0 ? (
              optionsArray.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${title}-${option}`}
                    checked={selectedOptions.has(option)}
                    onCheckedChange={(checked) => {
                      handleCheckboxChange(option, checked === true);
                    }}
                  />
                  <label
                    htmlFor={`${title}-${option}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No options available</div>
            )}
          </div>
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
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
  const [debouncedMin, setDebouncedMin] = useState(filters.priceRange.min);
  const [debouncedMax, setDebouncedMax] = useState(filters.priceRange.max);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (debouncedMin !== filters.priceRange.min || debouncedMax !== filters.priceRange.max) {
        onFiltersChange({
          ...filters,
          priceRange: {
            min: debouncedMin,
            max: debouncedMax
          }
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [debouncedMin, debouncedMax, filters, onFiltersChange]);

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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Price Range</Label>
            {(filters.priceRange.min > 0 || filters.priceRange.max < 10000) && (
              <button
                onClick={() => {
                  setDebouncedMin(0);
                  setDebouncedMax(10000);
                  onFiltersChange({
                    ...filters,
                    priceRange: { min: 0, max: 10000 }
                  });
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={debouncedMin}
              onChange={(e) => setDebouncedMin(Number(e.target.value))}
              min={0}
              className="h-8 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={debouncedMax}
              onChange={(e) => setDebouncedMax(Number(e.target.value))}
              min={0}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={defaultValues} className="w-full">
          <FilterSection
            title="Brand"
            options={brands}
            selectedOptions={filters.brands}
            onChange={(newBrands) => onFiltersChange({ ...filters, brands: newBrands })}
            defaultExpanded={hasActiveBrandFilters || defaultValues.includes("Brand")}
          />
          <FilterSection
            title="Processor"
            options={processors}
            selectedOptions={filters.processors}
            onChange={(newProcessors) => onFiltersChange({ ...filters, processors: newProcessors })}
            defaultExpanded={hasActiveProcessorFilters}
          />
          <FilterSection
            title="RAM"
            options={ramSizes}
            selectedOptions={filters.ramSizes}
            onChange={(newRamSizes) => onFiltersChange({ ...filters, ramSizes: newRamSizes })}
            defaultExpanded={hasActiveRamFilters}
          />
          <FilterSection
            title="Storage"
            options={storageOptions}
            selectedOptions={filters.storageOptions}
            onChange={(newStorageOptions) => onFiltersChange({ ...filters, storageOptions: newStorageOptions })}
            defaultExpanded={hasActiveStorageFilters}
          />
          <FilterSection
            title="Graphics"
            options={graphicsCards}
            selectedOptions={filters.graphicsCards}
            onChange={(newGraphicsCards) => onFiltersChange({ ...filters, graphicsCards: newGraphicsCards })}
            defaultExpanded={hasActiveGraphicsFilters}
          />
          <FilterSection
            title="Screen Size"
            options={screenSizes}
            selectedOptions={filters.screenSizes}
            onChange={(newScreenSizes) => onFiltersChange({ ...filters, screenSizes: newScreenSizes })}
            defaultExpanded={hasActiveScreenSizeFilters}
          />
        </Accordion>
      </div>
    </ScrollArea>
  );
}

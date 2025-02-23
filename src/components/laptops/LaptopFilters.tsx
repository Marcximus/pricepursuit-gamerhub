
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useState, useCallback } from "react";

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
};

const FilterSection = ({ title, options, selectedOptions, onChange }: FilterSectionProps) => {
  const optionsArray = Array.from(options).sort();

  const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
    const newSelected = new Set(selectedOptions);
    if (checked) {
      newSelected.add(option);
    } else {
      newSelected.delete(option);
    }
    onChange(newSelected);
  }, [selectedOptions, onChange]);

  return (
    <AccordionItem value={title} className="border-b">
      <AccordionTrigger className="text-sm font-medium hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
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

  const allSections = ["Brand", "Processor", "RAM", "Storage", "Graphics", "Screen Size"];

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={debouncedMin}
              onChange={(e) => setDebouncedMin(Number(e.target.value))}
              className="h-8 text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={debouncedMax}
              onChange={(e) => setDebouncedMax(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <Accordion type="multiple" defaultValue={allSections} className="w-full">
          <FilterSection
            title="Brand"
            options={brands}
            selectedOptions={filters.brands}
            onChange={(newBrands) => onFiltersChange({ ...filters, brands: newBrands })}
          />
          <FilterSection
            title="Processor"
            options={processors}
            selectedOptions={filters.processors}
            onChange={(newProcessors) => onFiltersChange({ ...filters, processors: newProcessors })}
          />
          <FilterSection
            title="RAM"
            options={ramSizes}
            selectedOptions={filters.ramSizes}
            onChange={(newRamSizes) => onFiltersChange({ ...filters, ramSizes: newRamSizes })}
          />
          <FilterSection
            title="Storage"
            options={storageOptions}
            selectedOptions={filters.storageOptions}
            onChange={(newStorageOptions) => onFiltersChange({ ...filters, storageOptions: newStorageOptions })}
          />
          <FilterSection
            title="Graphics"
            options={graphicsCards}
            selectedOptions={filters.graphicsCards}
            onChange={(newGraphicsCards) => onFiltersChange({ ...filters, graphicsCards: newGraphicsCards })}
          />
          <FilterSection
            title="Screen Size"
            options={screenSizes}
            selectedOptions={filters.screenSizes}
            onChange={(newScreenSizes) => onFiltersChange({ ...filters, screenSizes: newScreenSizes })}
          />
        </Accordion>
      </div>
    </ScrollArea>
  );
}

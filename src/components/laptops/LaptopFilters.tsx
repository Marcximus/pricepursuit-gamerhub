
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Product } from "@/types/product";

export type FilterOptions = {
  priceRange: { min: number; max: number };
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  screenSize: string;
  brand: string;
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

const defaultFilters: FilterOptions = {
  priceRange: { min: 0, max: 10000 },
  processor: "all-processors",
  ram: "all-ram",
  storage: "all-storage",
  graphics: "all-graphics",
  screenSize: "all-screens",
  brand: "all-brands",
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
  // Helper to check if a filter is active
  const isFilterActive = (key: keyof FilterOptions) => {
    if (key === 'priceRange') {
      return filters.priceRange.min > 0 || filters.priceRange.max < 10000;
    }
    return filters[key] !== defaultFilters[key];
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).reduce((count, key) => {
    return count + (isFilterActive(key as keyof FilterOptions) ? 1 : 0);
  }, 0);

  // Reset all filters
  const handleResetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Active Filters</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {isFilterActive('priceRange') && (
              <Badge variant="secondary" className="gap-1">
                Price Range: ${filters.priceRange.min} - ${filters.priceRange.max}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({
                    ...filters,
                    priceRange: defaultFilters.priceRange
                  })}
                />
              </Badge>
            )}
            {isFilterActive('brand') && (
              <Badge variant="secondary" className="gap-1">
                Brand: {filters.brand.replace('all-brands', '')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFiltersChange({
                    ...filters,
                    brand: defaultFilters.brand
                  })}
                />
              </Badge>
            )}
            {/* Add more active filter badges here */}
          </div>
          <Separator className="my-4" />
        </div>
      )}

      {/* Brand Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Brand</Label>
        <Select
          value={filters.brand}
          onValueChange={(value) => onFiltersChange({ ...filters, brand: value })}
        >
          <SelectTrigger className="h-8 text-sm bg-background">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-brands">All Brands</SelectItem>
            {Array.from(brands).map((brand) => (
              brand && <SelectItem key={String(brand)} value={String(brand)}>{String(brand)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Min Price</Label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min}
              onChange={(e) => onFiltersChange({
                ...filters,
                priceRange: { ...filters.priceRange, min: Number(e.target.value) }
              })}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max Price</Label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max}
              onChange={(e) => onFiltersChange({
                ...filters,
                priceRange: { ...filters.priceRange, max: Number(e.target.value) }
              })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Performance Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Performance</Label>
        
        {/* Processor Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Processor</Label>
          <Select
            value={filters.processor}
            onValueChange={(value) => onFiltersChange({ ...filters, processor: value })}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Select processor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-processors">All Processors</SelectItem>
              {Array.from(processors).map((processor) => (
                processor && <SelectItem key={String(processor)} value={String(processor)}>{String(processor)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* RAM Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">RAM</Label>
          <Select
            value={filters.ram}
            onValueChange={(value) => onFiltersChange({ ...filters, ram: value })}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Select RAM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-ram">All RAM sizes</SelectItem>
              {Array.from(ramSizes).map((ram) => (
                ram && <SelectItem key={String(ram)} value={String(ram)}>{String(ram)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Graphics Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Graphics</Label>
          <Select
            value={filters.graphics}
            onValueChange={(value) => onFiltersChange({ ...filters, graphics: value })}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Select graphics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-graphics">All graphics cards</SelectItem>
              {Array.from(graphicsCards).map((graphics) => (
                graphics && <SelectItem key={String(graphics)} value={String(graphics)}>{String(graphics)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Storage and Display */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Storage & Display</Label>
        
        {/* Storage Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Storage</Label>
          <Select
            value={filters.storage}
            onValueChange={(value) => onFiltersChange({ ...filters, storage: value })}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Select storage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-storage">All storage options</SelectItem>
              {Array.from(storageOptions).map((storage) => (
                storage && <SelectItem key={String(storage)} value={String(storage)}>{String(storage)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Screen Size Filter */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Screen Size</Label>
          <Select
            value={filters.screenSize}
            onValueChange={(value) => onFiltersChange({ ...filters, screenSize: value })}
          >
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Select screen size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-screens">All screen sizes</SelectItem>
              {Array.from(screenSizes).map((size) => (
                size && <SelectItem key={String(size)} value={String(size)}>{String(size)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}


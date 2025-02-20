
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/types/product";

export type FilterOptions = {
  priceRange: { min: number; max: number };
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  screenSize: string;
};

type LaptopFiltersProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  processors: Set<string>;
  ramSizes: Set<string>;
  storageOptions: Set<string>;
  graphicsCards: Set<string>;
  screenSizes: Set<string>;
};

export function LaptopFilters({
  filters,
  onFiltersChange,
  processors,
  ramSizes,
  storageOptions,
  graphicsCards,
  screenSizes,
}: LaptopFiltersProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                })}
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) => onFiltersChange({
                  ...filters,
                  priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                })}
              />
            </div>
          </div>

          {/* Processor Filter */}
          <div className="space-y-2">
            <Label>Processor</Label>
            <Select
              value={filters.processor}
              onValueChange={(value) => onFiltersChange({ ...filters, processor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select processor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Processors</SelectItem>
                {Array.from(processors).map((processor) => (
                  processor && <SelectItem key={String(processor)} value={String(processor)}>{String(processor)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RAM Filter */}
          <div className="space-y-2">
            <Label>RAM</Label>
            <Select
              value={filters.ram}
              onValueChange={(value) => onFiltersChange({ ...filters, ram: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select RAM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All RAM sizes</SelectItem>
                {Array.from(ramSizes).map((ram) => (
                  ram && <SelectItem key={String(ram)} value={String(ram)}>{String(ram)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Storage Filter */}
          <div className="space-y-2">
            <Label>Storage</Label>
            <Select
              value={filters.storage}
              onValueChange={(value) => onFiltersChange({ ...filters, storage: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select storage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All storage options</SelectItem>
                {Array.from(storageOptions).map((storage) => (
                  storage && <SelectItem key={String(storage)} value={String(storage)}>{String(storage)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Graphics Filter */}
          <div className="space-y-2">
            <Label>Graphics</Label>
            <Select
              value={filters.graphics}
              onValueChange={(value) => onFiltersChange({ ...filters, graphics: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select graphics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All graphics cards</SelectItem>
                {Array.from(graphicsCards).map((graphics) => (
                  graphics && <SelectItem key={String(graphics)} value={String(graphics)}>{String(graphics)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Screen Size Filter */}
          <div className="space-y-2">
            <Label>Screen Size</Label>
            <Select
              value={filters.screenSize}
              onValueChange={(value) => onFiltersChange({ ...filters, screenSize: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select screen size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All screen sizes</SelectItem>
                {Array.from(screenSizes).map((size) => (
                  size && <SelectItem key={String(size)} value={String(size)}>{String(size)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

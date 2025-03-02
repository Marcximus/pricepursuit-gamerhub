
import { ArrowUpDown, Filter } from "lucide-react";
import { LaptopSort, type SortOption } from "./LaptopSort";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LaptopFilters, type FilterOptions } from "./LaptopFilters";
import type { Product } from "@/types/product";

interface LaptopToolbarProps {
  totalLaptops: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isLoading: boolean;
  isRefetching: boolean;
  // Added prop for mobile filters
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
  filterOptions?: {
    processors: Set<string>;
    ramSizes: Set<string>;
    storageOptions: Set<string>;
    graphicsCards: Set<string>;
    screenSizes: Set<string>;
    brands: Set<string>;
  };
  allLaptops?: Product[]; // Add optional allLaptops prop
}

export function LaptopToolbar({
  totalLaptops,
  sortBy,
  onSortChange,
  isLoading,
  isRefetching,
  filters,
  onFiltersChange,
  filterOptions,
  allLaptops,
}: LaptopToolbarProps) {
  const [open, setOpen] = useState(false);
  
  // Count active filters for badge
  const getActiveFiltersCount = () => {
    if (!filters) return 0;
    
    return (
      (filters.priceRange.min > 0 || filters.priceRange.max < 10000 ? 1 : 0) +
      filters.brands.size + 
      filters.processors.size + 
      filters.ramSizes.size + 
      filters.storageOptions.size + 
      filters.graphicsCards.size + 
      filters.screenSizes.size
    );
  };
  
  const activeFiltersCount = getActiveFiltersCount();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white border-b border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 text-slate-700">
        <span className="text-sm font-medium">
          {isLoading || isRefetching ? 'Loading...' : `${totalLaptops} laptops found`}
        </span>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Mobile filter button */}
        {filters && onFiltersChange && filterOptions && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="lg:hidden relative border-slate-200 text-slate-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <div className="h-full p-6">
                <h2 className="text-lg font-semibold mb-6">Filters</h2>
                <LaptopFilters
                  filters={filters}
                  onFiltersChange={(newFilters) => {
                    onFiltersChange(newFilters);
                  }}
                  processors={filterOptions.processors}
                  ramSizes={filterOptions.ramSizes}
                  storageOptions={filterOptions.storageOptions}
                  graphicsCards={filterOptions.graphicsCards}
                  screenSizes={filterOptions.screenSizes}
                  brands={filterOptions.brands}
                  allLaptops={allLaptops}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-500" />
          <LaptopSort sortBy={sortBy} onSortChange={onSortChange} />
        </div>
      </div>
    </div>
  );
}

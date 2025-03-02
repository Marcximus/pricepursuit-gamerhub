
import { ArrowUpDown, Filter, XCircle } from "lucide-react";
import { LaptopSort, type SortOption } from "./LaptopSort";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LaptopFilters, type FilterOptions } from "./LaptopFilters";

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
  isFilterOptionsLoading?: boolean;
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
  isFilterOptionsLoading
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

  // Get all active filter selections for displaying in the toolbar
  const getActiveFilterSelections = () => {
    if (!filters || !onFiltersChange) return [];
    
    const selections = [];
    
    if (filters.brands.size > 0) {
      Array.from(filters.brands).forEach(brand => 
        selections.push({ type: 'brands', value: brand })
      );
    }
    
    if (filters.processors.size > 0) {
      Array.from(filters.processors).forEach(processor => 
        selections.push({ type: 'processors', value: processor })
      );
    }
    
    if (filters.ramSizes.size > 0) {
      Array.from(filters.ramSizes).forEach(ram => 
        selections.push({ type: 'ramSizes', value: ram })
      );
    }
    
    if (filters.storageOptions.size > 0) {
      Array.from(filters.storageOptions).forEach(storage => 
        selections.push({ type: 'storageOptions', value: storage })
      );
    }
    
    if (filters.graphicsCards.size > 0) {
      Array.from(filters.graphicsCards).forEach(gpu => 
        selections.push({ type: 'graphicsCards', value: gpu })
      );
    }
    
    if (filters.screenSizes.size > 0) {
      Array.from(filters.screenSizes).forEach(screen => 
        selections.push({ type: 'screenSizes', value: screen })
      );
    }
    
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) {
      selections.push({ 
        type: 'priceRange', 
        value: `$${filters.priceRange.min} - $${filters.priceRange.max}` 
      });
    }
    
    return selections;
  };
  
  // Handle removing a filter
  const handleRemoveFilter = (filterType: string, value: string) => {
    if (!filters || !onFiltersChange) return;
    
    const newFilters = { ...filters };
    
    if (filterType === 'priceRange') {
      // Reset price range to defaults
      newFilters.priceRange = { min: 0, max: 10000 };
    } else if (filterType !== 'priceRange' && newFilters[filterType] instanceof Set) {
      const newSet = new Set(newFilters[filterType] as Set<string>);
      newSet.delete(value);
      newFilters[filterType] = newSet;
    }
    
    onFiltersChange(newFilters as FilterOptions);
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white border-b border-slate-200 rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-slate-700">
        <span className="text-sm font-medium">
          {isLoading || isRefetching ? 'Loading...' : `${totalLaptops} laptops found`}
        </span>
        
        {/* Show active filter selections inline */}
        {filters && onFiltersChange && getActiveFilterSelections().length > 0 && (
          <div className="flex flex-wrap gap-1.5 ml-2">
            {getActiveFilterSelections().map(({ type, value }, index) => (
              <button
                key={`toolbar-filter-${type}-${value}-${index}`}
                onClick={() => handleRemoveFilter(type, value)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors"
              >
                {value}
                <XCircle className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
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
                  isLoading={isFilterOptionsLoading}
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

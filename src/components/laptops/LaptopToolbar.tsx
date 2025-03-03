
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { LaptopSort, type SortOption } from "./LaptopSort";
import { type FilterOptions } from "./LaptopFilters";
import { ActiveFilterPills } from "./components/ActiveFilterPills";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { LaptopToolbarCounter } from "./components/LaptopToolbarCounter";

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

  // Handle removing a filter
  const handleRemoveFilter = (filterType: string, value: string) => {
    if (!filters || !onFiltersChange) return;
    
    const newFilters = { ...filters };
    const filterKey = filterType as keyof typeof newFilters;
    
    // Fix: Type safety check to ensure we're only operating on Set properties
    if (filterKey !== 'priceRange' && filterKey !== 'searchQuery' && newFilters[filterKey] instanceof Set) {
      // Use type assertion to help TypeScript understand this is a Set
      const newSet = new Set((newFilters[filterKey] as unknown as Set<string>));
      newSet.delete(value);
      newFilters[filterKey] = newSet as any; // Type assertion to satisfy TypeScript
      onFiltersChange(newFilters as FilterOptions);
    }
  };

  // Handle clearing search
  const handleClearSearch = () => {
    if (!filters || !onFiltersChange) return;
    
    onFiltersChange({
      ...filters,
      searchQuery: ""
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white border-b border-slate-200 rounded-lg shadow-sm">
      <LaptopToolbarCounter
        isLoading={isLoading}
        isRefetching={isRefetching}
        totalLaptops={totalLaptops}
      >
        {/* Active filter pills component */}
        {filters && onFiltersChange && (
          <ActiveFilterPills 
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearSearch={handleClearSearch}
          />
        )}
      </LaptopToolbarCounter>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Mobile filter drawer */}
        {filters && onFiltersChange && filterOptions && (
          <MobileFilterDrawer
            open={open}
            setOpen={setOpen}
            activeFiltersCount={activeFiltersCount}
            filters={filters}
            onFiltersChange={onFiltersChange}
            filterOptions={filterOptions}
          />
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

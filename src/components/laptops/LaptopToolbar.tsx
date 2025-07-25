import React from "react";
import { LaptopSort } from "./LaptopSort";
import { LaptopToolbarCounter } from "./components/LaptopToolbarCounter";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { SearchBar } from "./components/SearchBar";
import { SortOption } from "./LaptopSort";
import { FilterOptions } from "./LaptopFilters";
import { ActiveFilterPills } from "./components/ActiveFilterPills";

interface LaptopToolbarProps {
  totalCount: number;
  filteredCount: number;
  onSortChange: (sort: SortOption) => void;
  sortOption: SortOption;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isRefetching: boolean;
  filterOptions: {
    processors: Set<string>;
    ramSizes: Set<string>;
    storageOptions: Set<string>;
    graphicsCards: Set<string>;
    screenSizes: Set<string>;
    brands: Set<string>;
  };
}

const LaptopToolbar: React.FC<LaptopToolbarProps> = ({
  totalCount,
  filteredCount,
  onSortChange,
  sortOption,
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  isLoading,
  isRefetching,
  filterOptions,
}) => {
  // Calculate the number of active filters
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'priceRange') {
      // Fix TypeScript error by type guarding for priceRange
      const priceRange = value as { min: number; max: number };
      return count + ((priceRange.min > 0 || priceRange.max < 10000) ? 1 : 0);
    }
    if (key === 'searchQuery' && value) {
      return count + 1;
    }
    if (value instanceof Set && value.size > 0) {
      return count + 1;
    }
    return count;
  }, 0);
  
  // Handle removing an individual filter
  const handleRemoveFilter = (filterType: string, value: string) => {
    const newFilters = { ...filters };
    
    if (filterType in newFilters && filterType !== 'priceRange' && filterType !== 'searchQuery') {
      // Create a new Set without the selected value
      const currentSet = newFilters[filterType as keyof typeof newFilters] as Set<string>;
      const newSet = new Set(currentSet);
      newSet.delete(value);
      
      // Update the filters
      newFilters[filterType as keyof typeof newFilters] = newSet as any;
      setFilters(newFilters);
    }
  };
  
  // Handle clearing the search term
  const handleClearSearch = () => {
    if (typeof setSearchTerm === 'function') {
      // If value is a function (setState updater), use an empty string
      setSearchTerm('');
    }
  };
  
  // Handle resetting the price range
  const handleResetPriceRange = () => {
    setFilters({
      ...filters,
      priceRange: { min: 0, max: 10000 }
    });
  };
  
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Mobile-optimized layout */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="flex-1 min-w-0">
          <LaptopToolbarCounter
            isLoading={isLoading}
            isRefetching={isRefetching}
            totalLaptops={totalCount}
          >
            <div className="mt-2 max-w-full overflow-x-auto scroll-area">
              <ActiveFilterPills 
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearSearch={handleClearSearch}
                onResetPriceRange={handleResetPriceRange}
              />
            </div>
          </LaptopToolbarCounter>
        </div>
        
        {/* Controls row - optimized for mobile */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-2">
          <div className="flex items-center gap-2 flex-1 lg:flex-initial">
            <MobileFilterDrawer
              open={false} 
              setOpen={() => {}}
              activeFiltersCount={activeFiltersCount}
              filters={filters}
              onFiltersChange={setFilters}
              filterOptions={filterOptions}
            />
            <div className="flex-1 lg:flex-initial min-w-[140px]">
              <LaptopSort onChange={onSortChange} value={sortOption} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaptopToolbar;

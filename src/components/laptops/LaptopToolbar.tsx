
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
  
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <LaptopToolbarCounter
          isLoading={isLoading}
          isRefetching={isRefetching}
          totalLaptops={totalCount}
        >
          <ActiveFilterPills 
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearSearch={handleClearSearch}
          />
        </LaptopToolbarCounter>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <MobileFilterDrawer
            open={false} 
            setOpen={() => {}}
            activeFiltersCount={activeFiltersCount}
            filters={filters}
            onFiltersChange={setFilters}
            filterOptions={filterOptions}
          />
          <LaptopSort onChange={onSortChange} value={sortOption} />
        </div>
      </div>
      <SearchBar 
        onSearch={setSearchTerm} 
        placeholder="Search by name, brand, specs..." 
      />
    </div>
  );
};

export default LaptopToolbar;

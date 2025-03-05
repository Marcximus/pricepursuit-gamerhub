
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LaptopSort } from "./LaptopSort";
import { LaptopToolbarCounter } from "./components/LaptopToolbarCounter";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { SearchBar } from "./components/SearchBar";
import { SortOption } from "./LaptopSort";
import { FilterOptions } from "./LaptopFilters";
import { Check, Sparkles, Wand2 } from "lucide-react";

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
  const navigate = useNavigate();
  
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
  
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <LaptopToolbarCounter
          isLoading={isLoading}
          isRefetching={isRefetching}
          totalLaptops={totalCount}
        />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-grow md:flex-grow-0 bg-white hover:bg-gray-50 text-primary border-primary hover:text-primary-dark hover:border-primary-dark flex items-center gap-2"
            onClick={() => navigate('/recommend')}
          >
            <Sparkles className="w-4 h-4" />
            <span>Find Perfect Laptop</span>
          </Button>
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

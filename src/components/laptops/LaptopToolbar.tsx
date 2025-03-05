
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LaptopSort from "./LaptopSort";
import LaptopToolbarCounter from "./components/LaptopToolbarCounter";
import MobileFilterDrawer from "./components/MobileFilterDrawer";
import SearchBar from "./components/SearchBar";
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
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <LaptopToolbarCounter
          totalCount={totalCount}
          filteredCount={filteredCount}
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
            filters={filters}
            setFilters={setFilters}
          />
          <LaptopSort onChange={onSortChange} value={sortOption} />
        </div>
      </div>
      <SearchBar 
        value={searchTerm} 
        onChange={setSearchTerm} 
        placeholder="Search by name, brand, specs..." 
      />
    </div>
  );
};

export default LaptopToolbar;

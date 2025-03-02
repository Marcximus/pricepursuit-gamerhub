
import React from "react";
import { SearchBar } from "../components/SearchBar";
import { X } from "lucide-react";

type FilterHeaderProps = {
  onSearch: (query: string) => void;
  totalActiveFilters: number;
  onResetAllFilters: () => void;
};

export function FilterHeader({ 
  onSearch, 
  totalActiveFilters, 
  onResetAllFilters 
}: FilterHeaderProps) {
  return (
    <div className="p-4 bg-white border-b border-slate-200">
      <SearchBar 
        onSearch={onSearch}
        placeholder="Search laptops by name, specs..."
      />
      
      {totalActiveFilters > 0 && (
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-slate-500">
            {totalActiveFilters} active {totalActiveFilters === 1 ? 'filter' : 'filters'}
          </div>
          <button
            onClick={onResetAllFilters}
            className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium transition-colors"
          >
            <X className="h-3 w-3" />
            Reset all
          </button>
        </div>
      )}
    </div>
  );
}

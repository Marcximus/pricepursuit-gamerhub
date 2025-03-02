
import React from "react";
import { SearchBar } from "../components/SearchBar";

type FilterHeaderProps = {
  onSearch: (query: string) => void;
};

export function FilterHeader({ 
  onSearch
}: FilterHeaderProps) {
  return (
    <div className="p-4 bg-white border-b border-slate-200">
      <SearchBar 
        onSearch={onSearch}
        placeholder="Search laptops by name, specs..."
      />
    </div>
  );
}

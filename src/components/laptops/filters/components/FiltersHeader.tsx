
import React from "react";
import { SlidersHorizontal, X } from "lucide-react";

type FiltersHeaderProps = {
  totalActiveFilters: number;
  onResetAllFilters: () => void;
};

export function FiltersHeader({ totalActiveFilters, onResetAllFilters }: FiltersHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-5 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <p className="text-xs text-slate-500">Refine your search</p>
        </div>
      </div>
      {totalActiveFilters > 0 && (
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-medium rounded-full h-6 min-w-[24px] px-1.5 mr-2">
            {totalActiveFilters}
          </span>
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

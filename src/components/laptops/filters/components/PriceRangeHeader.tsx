
import React from "react";
import { DollarSign, X } from "lucide-react";
import { Label } from "@/components/ui/label";

type PriceRangeHeaderProps = {
  isFilterActive: boolean;
  onReset: () => void;
};

export function PriceRangeHeader({ isFilterActive, onReset }: PriceRangeHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <DollarSign className="h-3.5 w-3.5" />
        </div>
        <Label className="text-sm font-medium">Price Range</Label>
      </div>
      {isFilterActive && (
        <button
          onClick={onReset}
          className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium transition-colors"
        >
          <X className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  );
}

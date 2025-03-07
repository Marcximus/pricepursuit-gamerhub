
import React from "react";
import { DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";

type PriceRangeHeaderProps = {
  isFilterActive: boolean;
  onReset: () => void;
};

export function PriceRangeHeader({ isFilterActive, onReset }: PriceRangeHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <div className="h-6 w-6 flex items-center justify-center rounded-full bg-green-50 text-green-600">
          <DollarSign className="h-3.5 w-3.5" />
        </div>
        <Label className="text-sm font-medium">Price Range</Label>
      </div>
    </div>
  );
}

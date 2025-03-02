
import React from "react";
import { Input } from "@/components/ui/input";

type PriceInputsProps = {
  localMin: number;
  localMax: number;
  extendedMaxPrice: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
};

export function PriceInputs({ 
  localMin, 
  localMax, 
  extendedMaxPrice,
  onMinChange, 
  onMaxChange 
}: PriceInputsProps) {
  return (
    <div className="flex gap-3 items-center mt-8">
      <div className="relative flex-1">
        <Input
          type="number"
          value={localMin}
          onChange={(e) => onMinChange(Number(e.target.value))}
          min={0}
          max={localMax - 50}
          className="pl-8 h-10 text-sm rounded-md border-slate-300 focus:border-blue-300 focus:ring-blue-200"
        />
        <div className="absolute left-3 top-2.5 text-slate-500">$</div>
      </div>
      <span className="text-slate-400">to</span>
      <div className="relative flex-1">
        <Input
          type="number"
          value={localMax}
          onChange={(e) => onMaxChange(Number(e.target.value))}
          min={localMin + 50}
          max={extendedMaxPrice}
          className="pl-8 h-10 text-sm rounded-md border-slate-300 focus:border-blue-300 focus:ring-blue-200"
        />
        <div className="absolute left-3 top-2.5 text-slate-500">$</div>
      </div>
    </div>
  );
}

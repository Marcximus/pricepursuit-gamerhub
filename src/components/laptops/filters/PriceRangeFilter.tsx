
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type PriceRangeFilterProps = {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
};

export function PriceRangeFilter({ minPrice, maxPrice, onPriceChange }: PriceRangeFilterProps) {
  const [debouncedMin, setDebouncedMin] = useState(minPrice);
  const [debouncedMax, setDebouncedMax] = useState(maxPrice);
  
  const isDefaultPriceRange = minPrice === 0 && maxPrice === 10000;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (debouncedMin !== minPrice || debouncedMax !== maxPrice) {
        onPriceChange(debouncedMin, debouncedMax);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [debouncedMin, debouncedMax, minPrice, maxPrice, onPriceChange]);

  const handleResetPrice = () => {
    setDebouncedMin(0);
    setDebouncedMax(10000);
    onPriceChange(0, 10000);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Price Range</Label>
        {!isDefaultPriceRange && (
          <button
            onClick={handleResetPrice}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Reset
          </button>
        )}
      </div>
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="Min"
          value={debouncedMin}
          onChange={(e) => setDebouncedMin(Number(e.target.value))}
          min={0}
          className="h-8 text-sm"
        />
        <span className="text-sm text-gray-500">to</span>
        <Input
          type="number"
          placeholder="Max"
          value={debouncedMax}
          onChange={(e) => setDebouncedMax(Number(e.target.value))}
          min={0}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}

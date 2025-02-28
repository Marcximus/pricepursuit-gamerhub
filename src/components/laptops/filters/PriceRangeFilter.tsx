
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DollarSign } from "lucide-react";

type PriceRangeFilterProps = {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
};

export function PriceRangeFilter({ minPrice, maxPrice, onPriceChange }: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  
  const MAX_POSSIBLE_PRICE = 10000;
  const isDefaultPriceRange = minPrice === 0 && maxPrice === MAX_POSSIBLE_PRICE;

  // Update local state when props change
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  // Handle slider changes
  const handleSliderChange = (values: number[]) => {
    if (values.length === 2) {
      setLocalMin(values[0]);
      setLocalMax(values[1]);
    }
  };

  // Apply price filter after slider changes
  const handleSliderCommit = (values: number[]) => {
    if (values.length === 2) {
      onPriceChange(values[0], values[1]);
    }
  };

  // Handle input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localMin !== minPrice || localMax !== maxPrice) {
        onPriceChange(localMin, localMax);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localMin, localMax, minPrice, maxPrice, onPriceChange]);

  const handleResetPrice = () => {
    setLocalMin(0);
    setLocalMax(MAX_POSSIBLE_PRICE);
    onPriceChange(0, MAX_POSSIBLE_PRICE);
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <DollarSign className="h-4 w-4" />
          <Label className="text-sm font-medium">Price Range</Label>
        </div>
        {!isDefaultPriceRange && (
          <button
            onClick={handleResetPrice}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Reset
          </button>
        )}
      </div>

      <div className="pt-2 pb-6">
        <Slider
          defaultValue={[localMin, localMax]}
          value={[localMin, localMax]}
          max={MAX_POSSIBLE_PRICE}
          step={50}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="my-5"
        />
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            min={0}
            max={localMax - 50}
            className="pl-9 h-9 text-sm"
          />
          <div className="absolute left-3 top-2.5 text-slate-500">$</div>
        </div>
        <span className="text-slate-400">to</span>
        <div className="relative flex-1">
          <Input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            min={localMin + 50}
            max={MAX_POSSIBLE_PRICE}
            className="pl-9 h-9 text-sm"
          />
          <div className="absolute left-3 top-2.5 text-slate-500">$</div>
        </div>
      </div>

      <div className="flex justify-between mt-3 text-xs text-slate-500">
        <span>{formatPrice(minPrice)}</span>
        <span>{formatPrice(maxPrice)}</span>
      </div>
    </div>
  );
}

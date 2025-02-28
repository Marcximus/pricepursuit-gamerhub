import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { DollarSign } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type PriceRangeFilterProps = {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
};

export function PriceRangeFilter({ minPrice, maxPrice, onPriceChange }: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  const [extendedRange, setExtendedRange] = useState(maxPrice > 2000);
  
  const DEFAULT_MAX = 2000;
  const EXTENDED_MAX = 10000;
  const MAX_POSSIBLE_PRICE = extendedRange ? EXTENDED_MAX : DEFAULT_MAX;
  const isDefaultPriceRange = minPrice === 0 && (
    (extendedRange && maxPrice === EXTENDED_MAX) || (!extendedRange && maxPrice === DEFAULT_MAX)
  );

  // Create tick labels
  const generateTickLabels = () => {
    const labels = [];
    const tickCount = extendedRange ? 6 : 5; // 0, 500, 1000, 1500, 2000, (10000 if extended)
    for (let i = 0; i < tickCount; i++) {
      let value;
      if (extendedRange && i === tickCount - 1) {
        value = EXTENDED_MAX;
      } else {
        value = Math.round(i * (DEFAULT_MAX / (tickCount - (extendedRange ? 2 : 1))));
      }
      labels.push(formatPrice(value, true));
    }
    return labels;
  };

  // Update local state when props change
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    setExtendedRange(maxPrice > DEFAULT_MAX);
  }, [minPrice, maxPrice]);

  // Handle extended range toggle
  const handleRangeToggle = (checked: boolean) => {
    setExtendedRange(checked);
    
    // Adjust max value when toggling the extended range
    if (checked && localMax <= DEFAULT_MAX) {
      // If enabling extended range and max is within default range, keep it the same
      onPriceChange(localMin, localMax);
    } else if (!checked && localMax > DEFAULT_MAX) {
      // If disabling extended range and max is beyond default range, cap it
      setLocalMax(DEFAULT_MAX);
      onPriceChange(localMin, DEFAULT_MAX);
    } else {
      // Otherwise, keep the current values
      onPriceChange(localMin, localMax);
    }
  };

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
    const newMax = extendedRange ? EXTENDED_MAX : DEFAULT_MAX;
    setLocalMax(newMax);
    onPriceChange(0, newMax);
  };

  // Format price for display
  const formatPrice = (price: number, short: boolean = false) => {
    if (price >= EXTENDED_MAX && short) {
      return '10k+';
    }
    if (short && price >= 1000) {
      return `${Math.floor(price / 1000)}k${price === DEFAULT_MAX && extendedRange ? '+' : ''}`;
    }
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

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500">Show all prices</span>
        <div className="flex items-center gap-2">
          <Switch 
            id="extended-range"
            checked={extendedRange}
            onCheckedChange={handleRangeToggle}
          />
          <Label htmlFor="extended-range" className="text-xs font-medium cursor-pointer">
            {extendedRange ? '2k+ included' : 'Up to 2k'}
          </Label>
        </div>
      </div>

      <div className="pt-2">
        <Slider
          defaultValue={[localMin, localMax]}
          value={[localMin, localMax]}
          min={0}
          max={MAX_POSSIBLE_PRICE}
          step={50}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          showTicks={true}
          tickLabels={generateTickLabels()}
          className="my-5"
        />
      </div>

      <div className="flex gap-2 items-center mt-8">
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
    </div>
  );
}

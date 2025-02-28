
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
  const [extendedRange, setExtendedRange] = useState(false);
  
  const STANDARD_MAX_PRICE = 2000;
  const EXTENDED_MAX_PRICE = 10000;
  const MAX_POSSIBLE_PRICE = extendedRange ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE;
  
  const isDefaultPriceRange = minPrice === 0 && maxPrice === EXTENDED_MAX_PRICE;

  // Create tick labels based on the current range
  const generateTickLabels = () => {
    const labels = [];
    const tickCount = extendedRange ? 6 : 5; // 0, 500, 1000, 1500, 2000, (10000 if extended)
    
    for (let i = 0; i < tickCount - 1; i++) {
      const value = Math.round(i * (STANDARD_MAX_PRICE / (tickCount - 1)));
      labels.push(formatPrice(value, true));
    }
    
    // Add the last label based on the range
    labels.push(extendedRange ? "10k" : "2k");
    
    return labels;
  };

  // Update local state when props change
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    
    // Set extended range if maxPrice is higher than standard
    if (maxPrice > STANDARD_MAX_PRICE) {
      setExtendedRange(true);
    }
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

  // Handle extended range toggle
  const handleRangeToggle = (checked: boolean) => {
    setExtendedRange(checked);
    
    // When enabling extended range and max price is at standard max, extend it to the full range
    if (checked && localMax === STANDARD_MAX_PRICE) {
      setLocalMax(EXTENDED_MAX_PRICE);
      onPriceChange(localMin, EXTENDED_MAX_PRICE);
    } 
    // When disabling extended range, cap the max price at standard max
    else if (!checked && localMax > STANDARD_MAX_PRICE) {
      setLocalMax(STANDARD_MAX_PRICE);
      onPriceChange(localMin, STANDARD_MAX_PRICE);
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
    setLocalMax(extendedRange ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE);
    onPriceChange(0, extendedRange ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE);
  };

  // Format price for display
  const formatPrice = (price: number, short: boolean = false) => {
    if (short && price >= 1000) {
      return `${Math.floor(price / 1000)}k`;
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
        <span className="text-xs text-slate-500">Standard range (0-2k)</span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Include premium (2k+)</span>
          <Switch 
            checked={extendedRange} 
            onCheckedChange={handleRangeToggle}
            aria-label="Extended price range toggle"
          />
        </div>
      </div>

      <div className="pt-2">
        <Slider
          value={[localMin, Math.min(localMax, MAX_POSSIBLE_PRICE)]}
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

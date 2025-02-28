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
  const [includeHigherPrices, setIncludeHigherPrices] = useState(false);
  
  const STANDARD_MAX_PRICE = 2000;
  const EXTENDED_MAX_PRICE = 10000;
  
  const currentMaxPrice = includeHigherPrices ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE;
  const isDefaultPriceRange = minPrice === 0 && maxPrice === currentMaxPrice;

  // Initialize local max based on whether price is beyond standard range
  useEffect(() => {
    setIncludeHigherPrices(maxPrice > STANDARD_MAX_PRICE);
  }, []);

  // Create tick labels
  const generateTickLabels = () => {
    const labels = [];
    const tickCount = includeHigherPrices ? 6 : 5; // 0, 500, 1000, 1500, 2000, (10000 if extended)
    
    for (let i = 0; i < tickCount - 1; i++) {
      const value = Math.round(i * (STANDARD_MAX_PRICE / (tickCount - 2)));
      labels.push(formatPrice(value, true));
    }
    
    // Add the last label based on current max
    if (includeHigherPrices) {
      labels.push(formatPrice(EXTENDED_MAX_PRICE, true));
    } else {
      labels.push(formatPrice(STANDARD_MAX_PRICE, true) + "+");
    }
    
    return labels;
  };

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

  // Handle high price toggle change
  const handleHighPriceToggle = (checked: boolean) => {
    setIncludeHigherPrices(checked);
    
    // Adjust max price based on toggle state
    if (checked) {
      // If turning on higher prices, keep current max if higher than standard
      const newMax = localMax > STANDARD_MAX_PRICE ? localMax : EXTENDED_MAX_PRICE;
      setLocalMax(newMax);
      onPriceChange(localMin, newMax);
    } else {
      // If turning off higher prices, cap at standard max
      const newMax = Math.min(localMax, STANDARD_MAX_PRICE);
      setLocalMax(newMax);
      onPriceChange(localMin, newMax);
    }
  };

  const handleResetPrice = () => {
    setLocalMin(0);
    setLocalMax(currentMaxPrice);
    onPriceChange(0, currentMaxPrice);
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

      <div className="pt-2">
        <Slider
          defaultValue={[localMin, localMax]}
          value={[localMin, localMax]}
          min={0}
          max={currentMaxPrice}
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
            max={currentMaxPrice}
            className="pl-9 h-9 text-sm"
          />
          <div className="absolute left-3 top-2.5 text-slate-500">$</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <Label htmlFor="include-higher-prices" className="text-sm text-slate-600">
          Include higher prices (2k+)
        </Label>
        <Switch
          id="include-higher-prices"
          checked={includeHigherPrices}
          onCheckedChange={handleHighPriceToggle}
        />
      </div>
    </div>
  );
}

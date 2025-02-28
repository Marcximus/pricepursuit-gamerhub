
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
  const [showExtendedRange, setShowExtendedRange] = useState(maxPrice > 2000);
  
  const STANDARD_MAX_PRICE = 2000;
  const EXTENDED_MAX_PRICE = 10000;
  const MAX_POSSIBLE_PRICE = showExtendedRange ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE;
  
  // Update isDefaultPriceRange calculation based on current MAX_POSSIBLE_PRICE
  const isDefaultPriceRange = minPrice === 0 && maxPrice === MAX_POSSIBLE_PRICE;

  // Create tick labels
  const generateTickLabels = () => {
    const labels = [];
    const tickCount = 6;
    for (let i = 0; i < tickCount; i++) {
      const value = Math.round(i * (MAX_POSSIBLE_PRICE / (tickCount - 1)));
      labels.push(formatPrice(value, true));
    }
    return labels;
  };

  // Update local state when props change
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    setShowExtendedRange(maxPrice > 2000);
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

  const togglePriceRange = () => {
    const newExtendedState = !showExtendedRange;
    setShowExtendedRange(newExtendedState);
    
    // Adjust the max value when switching ranges
    const newMaxPrice = newExtendedState ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE;
    
    // If current max is greater than new max, adjust it
    if (localMax > newMaxPrice) {
      setLocalMax(newMaxPrice);
      onPriceChange(localMin, newMaxPrice);
    } else if (localMax === STANDARD_MAX_PRICE && newExtendedState) {
      // If at exactly 2000 and switching to extended, keep at 2000
      onPriceChange(localMin, localMax);
    } else if (localMax === EXTENDED_MAX_PRICE && !newExtendedState) {
      // If at exactly 10000 and switching to standard, set to 2000
      setLocalMax(STANDARD_MAX_PRICE);
      onPriceChange(localMin, STANDARD_MAX_PRICE);
    } else {
      // In all other cases, just apply current values with new range
      onPriceChange(localMin, localMax);
    }
    
    console.log("Toggle price range:", {
      newExtendedState,
      newMaxPrice,
      localMin,
      localMax: newExtendedState && localMax < STANDARD_MAX_PRICE ? localMax : newMaxPrice
    });
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
        <div className="flex items-center gap-2">
          {!isDefaultPriceRange && (
            <button
              onClick={handleResetPrice}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Reset
            </button>
          )}
          <button
            onClick={togglePriceRange}
            className={`text-xs px-2 py-0.5 rounded ${
              showExtendedRange 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            } font-medium transition-colors`}
          >
            {showExtendedRange ? 'Standard' : '3+ K'}
          </button>
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

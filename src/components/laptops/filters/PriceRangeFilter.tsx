
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
  
  const STANDARD_MAX_PRICE = 2000;
  const EXTENDED_MAX_PRICE = 10000;
  
  // Determine if we're in extended price mode based on max value
  const [isExtendedPrice, setIsExtendedPrice] = useState(maxPrice > STANDARD_MAX_PRICE);
  
  // Current max for the slider depends on mode
  const currentMaxPrice = isExtendedPrice ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE;
  const isDefaultPriceRange = minPrice === 0 && maxPrice === (isExtendedPrice ? EXTENDED_MAX_PRICE : STANDARD_MAX_PRICE);

  // Initialize local state when props change
  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
    setIsExtendedPrice(maxPrice > STANDARD_MAX_PRICE);
  }, [minPrice, maxPrice]);

  // Create tick labels
  const generateTickLabels = () => {
    const labels = [];
    // Show 5 ticks for standard range: 0, 500, 1000, 1500, 2000+
    const tickCount = 5; 
    
    for (let i = 0; i < tickCount - 1; i++) {
      const value = Math.round(i * (STANDARD_MAX_PRICE / (tickCount - 1)));
      labels.push(formatPrice(value, true));
    }
    
    // Always add the last label with a plus sign to indicate higher prices are available
    labels.push(formatPrice(STANDARD_MAX_PRICE, true) + "+");
    
    return labels;
  };

  // Handle slider changes
  const handleSliderChange = (values: number[]) => {
    if (values.length === 2) {
      const newMin = values[0];
      let newMax = values[1];
      
      // If user moves the max handle to the max value (2000), switch to extended price mode
      if (newMax === STANDARD_MAX_PRICE && !isExtendedPrice) {
        setIsExtendedPrice(true);
        newMax = EXTENDED_MAX_PRICE;
      } 
      // If user moves the max below 2000 and we're in extended mode, switch to standard mode
      else if (newMax < STANDARD_MAX_PRICE && isExtendedPrice) {
        setIsExtendedPrice(false);
      }
      
      setLocalMin(newMin);
      setLocalMax(newMax);
    }
  };

  // Apply price filter after slider changes
  const handleSliderCommit = (values: number[]) => {
    if (values.length === 2) {
      let min = values[0];
      let max = values[1];
      
      // If committing at max value, use extended range
      if (max === STANDARD_MAX_PRICE && !isExtendedPrice) {
        setIsExtendedPrice(true);
        max = EXTENDED_MAX_PRICE;
      }
      
      setLocalMax(max);
      onPriceChange(min, max);
    }
  };

  // Handle input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localMin !== minPrice || localMax !== maxPrice) {
        // If user types a max value above standard price, automatically switch to extended mode
        if (localMax > STANDARD_MAX_PRICE && !isExtendedPrice) {
          setIsExtendedPrice(true);
        } 
        // If user types a max value below standard while in extended mode, switch to standard
        else if (localMax <= STANDARD_MAX_PRICE && isExtendedPrice) {
          setIsExtendedPrice(false);
        }
        
        onPriceChange(localMin, localMax);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localMin, localMax, minPrice, maxPrice, onPriceChange, isExtendedPrice]);

  const handleResetPrice = () => {
    setLocalMin(0);
    // Reset to standard price range
    setIsExtendedPrice(false);
    setLocalMax(STANDARD_MAX_PRICE);
    onPriceChange(0, STANDARD_MAX_PRICE);
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
          value={[localMin, Math.min(localMax, STANDARD_MAX_PRICE)]} // Visually cap at 2000
          min={0}
          max={STANDARD_MAX_PRICE}
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
            max={EXTENDED_MAX_PRICE}
            className="pl-9 h-9 text-sm"
          />
          <div className="absolute left-3 top-2.5 text-slate-500">$</div>
        </div>
      </div>
    </div>
  );
}

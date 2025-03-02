
import { useEffect, useState } from "react";
import { PriceRangeHeader } from "./components/PriceRangeHeader";
import { PriceSlider } from "./components/PriceSlider";
import { PriceInputs } from "./components/PriceInputs";

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

  // Handle min input change
  const handleMinChange = (value: number) => {
    setLocalMin(value);
  };

  // Handle max input change
  const handleMaxChange = (value: number) => {
    setLocalMax(value);
  };

  // Handle reset price button click
  const handleResetPrice = () => {
    setLocalMin(0);
    // Reset to standard price range
    setIsExtendedPrice(false);
    setLocalMax(STANDARD_MAX_PRICE);
    onPriceChange(0, STANDARD_MAX_PRICE);
  };

  // Apply price filter after input changes
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

  return (
    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm mb-5">
      <PriceRangeHeader
        isFilterActive={!isDefaultPriceRange}
        onReset={handleResetPrice}
      />

      <PriceSlider
        localMin={localMin}
        localMax={localMax}
        currentMaxPrice={STANDARD_MAX_PRICE}
        onSliderChange={handleSliderChange}
        onSliderCommit={handleSliderCommit}
      />

      <PriceInputs
        localMin={localMin}
        localMax={localMax}
        extendedMaxPrice={EXTENDED_MAX_PRICE}
        onMinChange={handleMinChange}
        onMaxChange={handleMaxChange}
      />
    </div>
  );
}

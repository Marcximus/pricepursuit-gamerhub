
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onChange: (min: number, max: number) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPrice,
  maxPrice,
  onChange
}) => {
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);
  
  // Max possible price for slider
  const MAX_SLIDER_PRICE = 6000;

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values;
    setLocalMin(min);
    setLocalMax(max);
    onChange(min, max);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value < localMax) {
      setLocalMin(value);
      onChange(value, localMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > localMin && value <= MAX_SLIDER_PRICE) {
      setLocalMax(value);
      onChange(localMin, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-6">
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">Min Price ($)</label>
          <div className="relative">
            <Input
              type="number"
              value={localMin}
              onChange={handleMinChange}
              min={0}
              max={localMax - 50}
              step={50}
              className="pl-7"
            />
            <div className="absolute left-2 top-2.5 text-gray-500">$</div>
          </div>
        </div>
        <div className="flex-1">
          <label className="text-sm text-gray-600 mb-1 block">Max Price ($)</label>
          <div className="relative">
            <Input
              type="number"
              value={localMax}
              onChange={handleMaxChange}
              min={localMin + 50}
              max={MAX_SLIDER_PRICE}
              step={50}
              className="pl-7"
            />
            <div className="absolute left-2 top-2.5 text-gray-500">$</div>
          </div>
        </div>
      </div>
      
      <Slider
        value={[localMin, localMax]}
        min={0}
        max={MAX_SLIDER_PRICE}
        step={50}
        onValueChange={handleSliderChange}
        className="my-6"
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>$0</span>
        <span>$1500</span>
        <span>$3000</span>
        <span>$4500</span>
        <span>$6000</span>
      </div>
    </div>
  );
};

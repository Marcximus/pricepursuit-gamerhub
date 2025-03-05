
import React from 'react';
import { Slider } from '@/components/ui/slider';

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
  const handleMinPriceChange = (value: number[]) => {
    // Ensure min price doesn't exceed max price
    if (value[0] < maxPrice) {
      onChange(value[0], maxPrice);
    }
  };

  const handleMaxPriceChange = (value: number[]) => {
    // Ensure max price doesn't go below min price
    if (value[0] > minPrice) {
      onChange(minPrice, value[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-blue-600 font-medium">Minimum Price: <span className="font-bold">${minPrice}</span></label>
        </div>
        <Slider
          defaultValue={[minPrice]}
          max={6000}
          min={100}
          step={50}
          value={[minPrice]}
          onValueChange={handleMinPriceChange}
          className="my-4"
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm text-blue-600 font-medium">Maximum Price: <span className="font-bold">${maxPrice}</span></label>
        </div>
        <Slider
          defaultValue={[maxPrice]}
          max={6000}
          min={100}
          step={50}
          value={[maxPrice]}
          onValueChange={handleMaxPriceChange}
          className="my-4"
        />
      </div>
      
      <div className="py-3 px-4 bg-white rounded-lg border border-blue-200 flex justify-between">
        <div className="text-sm font-medium text-gray-700">Range:</div>
        <div className="text-sm font-bold text-blue-700">${minPrice} - ${maxPrice}</div>
      </div>
    </div>
  );
};

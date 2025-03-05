
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
  const handleRangeChange = (values: number[]) => {
    if (values.length === 2) {
      onChange(values[0], values[1]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-blue-600 font-medium">Minimum Price: <span className="font-bold">${minPrice}</span></div>
          <div className="text-sm text-blue-600 font-medium">Maximum Price: <span className="font-bold">${maxPrice}</span></div>
        </div>
        
        <Slider
          defaultValue={[minPrice, maxPrice]}
          max={6000}
          min={100}
          step={50}
          value={[minPrice, maxPrice]}
          onValueChange={handleRangeChange}
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

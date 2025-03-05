
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
        <Slider
          defaultValue={[minPrice, maxPrice]}
          max={6000}
          min={100}
          step={50}
          value={[minPrice, maxPrice]}
          onValueChange={handleRangeChange}
          className="my-6"
          showTicks={true}
          tickCount={5}
        />
        
        <div className="flex justify-between items-center mt-2">
          <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white text-xs font-medium shadow-md">
            Min: ${minPrice}
          </div>
          <div className="text-sm font-medium text-gray-500">
            Price Range
          </div>
          <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg text-white text-xs font-medium shadow-md">
            Max: ${maxPrice}
          </div>
        </div>
      </div>
      
      <div className="py-3 px-4 bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-lg border border-slate-700 flex justify-between items-center shadow-lg backdrop-blur-sm">
        <div className="text-sm font-medium text-slate-300">Selected Range:</div>
        <div className="text-sm font-bold text-blue-400">${minPrice} - ${maxPrice}</div>
      </div>
    </div>
  );
};

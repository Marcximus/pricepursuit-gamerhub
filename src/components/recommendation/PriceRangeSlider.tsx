
import React, { useMemo } from 'react';
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

  // Define specific tick values from 100 to 6000
  const tickValues = useMemo(() => {
    return [
      100, 500, 1000, 1500, 2000, 2500, 
      3000, 3500, 4000, 4500, 5000, 5500, 6000
    ];
  }, []);

  // Format price for display
  const formatPrice = (price: number) => {
    if (price === 6000) {
      return `$${price}+`;
    }
    return `$${price}`;
  };

  return (
    <div className="space-y-6">
      <div className="relative pt-2">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-green-900/10 to-emerald-900/10 rounded-xl -z-10"></div>
        
        <div className="mb-8 space-y-3">
          <div className="flex justify-between items-center px-1">
            <div className="text-xs uppercase tracking-wider text-green-500 font-semibold">Min</div>
            <div className="text-xs uppercase tracking-wider text-green-500 font-semibold">Max</div>
          </div>
          
          <Slider
            defaultValue={[minPrice, maxPrice]}
            max={6000}
            min={100}
            step={50}
            value={[minPrice, maxPrice]}
            onValueChange={handleRangeChange}
            className="my-4"
            showTicks={true}
            tickLabels={tickValues.map(formatPrice)}
          />
          
          <div className="flex justify-between items-center">
            <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg text-white text-xs font-medium shadow-md ring-1 ring-white/10">
              ${minPrice}
            </div>
            <div className="text-xs font-medium text-green-300 uppercase tracking-wider">
              Price Range
            </div>
            <div className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white text-xs font-medium shadow-md ring-1 ring-white/10">
              ${maxPrice}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 blur-xl"></div>
        <div className="py-3.5 px-5 bg-gradient-to-r from-slate-900/90 to-green-900/80 rounded-xl border border-green-500/30 flex justify-between items-center shadow-lg backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <div className="text-sm font-medium text-green-200">Selected Range</div>
          </div>
          <div className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-white">
            ${minPrice} - ${maxPrice}
          </div>
        </div>
      </div>
    </div>
  );
};


import React from "react";
import { Slider } from "@/components/ui/slider";

type PriceSliderProps = {
  localMin: number;
  localMax: number;
  currentMaxPrice: number;
  onSliderChange: (values: number[]) => void;
  onSliderCommit: (values: number[]) => void;
};

export function PriceSlider({ 
  localMin, 
  localMax, 
  currentMaxPrice, 
  onSliderChange, 
  onSliderCommit 
}: PriceSliderProps) {
  // Format price for display
  const formatPrice = (price: number, short: boolean = false) => {
    if (short && price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Create tick labels
  const generateTickLabels = () => {
    const STANDARD_MAX_PRICE = 2000;
    const labels = [];
    // Show 5 ticks: 0, 500, 1000, 1500, 2000+
    const tickValues = [0, 500, 1000, 1500, STANDARD_MAX_PRICE];
    
    tickValues.forEach((value, index) => {
      if (index === tickValues.length - 1) {
        // Add plus sign to the last label
        labels.push(formatPrice(value, true) + "+");
      } else {
        labels.push(formatPrice(value, true));
      }
    });
    
    return labels;
  };

  return (
    <div className="pt-0">
      <Slider
        defaultValue={[localMin, localMax]}
        value={[localMin, Math.min(localMax, currentMaxPrice)]}
        min={0}
        max={currentMaxPrice}
        step={50}
        onValueChange={onSliderChange}
        onValueCommit={onSliderCommit}
        showTicks={true}
        tickLabels={generateTickLabels()}
        className="my-3 [&>[role=slider]]:bg-green-600 [&_[data-orientation=horizontal]>div]:bg-green-600 [&_[data-orientation=horizontal]]:bg-green-200"
      />
    </div>
  );
}

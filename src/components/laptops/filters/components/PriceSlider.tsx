
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
      return `${Math.floor(price / 1000)}k`;
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

  return (
    <div className="pt-2">
      <Slider
        defaultValue={[localMin, localMax]}
        value={[localMin, Math.min(localMax, currentMaxPrice)]} // Visually cap at max
        min={0}
        max={currentMaxPrice}
        step={50}
        onValueChange={onSliderChange}
        onValueCommit={onSliderCommit}
        showTicks={true}
        tickLabels={generateTickLabels()}
        className="my-5"
      />
    </div>
  );
}

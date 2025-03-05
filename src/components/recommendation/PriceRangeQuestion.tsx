
import React from 'react';
import { Button } from '@/components/ui/button';
import { PriceRangeSlider } from './PriceRangeSlider';
import { priceRangeOptions, priceRangeEmojis } from './config/quizConfig';
import { PriceRangeType } from './types/quizTypes';

interface PriceRangeQuestionProps {
  selectedOption: PriceRangeType;  // Changed from string to PriceRangeType
  customMinPrice: number;
  customMaxPrice: number;
  onSelect: (value: string) => void;
  onRangeChange: (min: number, max: number) => void;
}

export const PriceRangeQuestion: React.FC<PriceRangeQuestionProps> = ({
  selectedOption,
  customMinPrice,
  customMaxPrice,
  onSelect,
  onRangeChange
}) => {
  // Convert selectedOption to string for comparison if it's an array
  const selectedOptionStr = Array.isArray(selectedOption) ? `${selectedOption[0]} - ${selectedOption[1]}` : selectedOption;

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">What is your price range?</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {priceRangeOptions.map((option, index) => (
            <Button
              key={option}
              variant={selectedOptionStr === option ? "default" : "outline"}
              className="justify-start text-left h-auto py-3"
              onClick={() => onSelect(option)}
            >
              <span className="mr-2 text-xl" aria-hidden="true">
                {priceRangeEmojis[index]}
              </span>
              {option}
            </Button>
          ))}
        </div>
        
        {(selectedOptionStr === 'Custom Range' || (typeof selectedOptionStr === 'string' && selectedOptionStr.startsWith('Custom:'))) && (
          <div className="mt-4">
            <PriceRangeSlider 
              minPrice={customMinPrice} 
              maxPrice={customMaxPrice}
              onChange={onRangeChange}
            />
          </div>
        )}
      </div>
    </>
  );
};


import React from 'react';
import { Button } from '@/components/ui/button';
import { PriceRangeSlider } from './PriceRangeSlider';
import { priceRangeOptions, priceRangeEmojis } from './config/quizConfig';

interface PriceRangeQuestionProps {
  selectedOption: string;
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
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">What is your price range?</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {priceRangeOptions.map((option, index) => (
            <Button
              key={option}
              variant={selectedOption === option ? "default" : "outline"}
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
        
        {(selectedOption === 'Custom Range' || selectedOption.startsWith('Custom:')) && (
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

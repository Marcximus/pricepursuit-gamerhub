
import React from 'react';
import { Button } from '@/components/ui/button';
import { PriceRangeSlider } from './PriceRangeSlider';
import { priceRangeOptions, priceRangeEmojis } from './config/quizConfig';
import { PriceRangeType } from './types/quizTypes';

interface PriceRangeQuestionProps {
  selectedOption: PriceRangeType;
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
  const selectedOptionStr = Array.isArray(selectedOption) 
    ? `Custom: USD ${selectedOption[0]} - ${selectedOption[1]}` 
    : selectedOption;

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">What is your price range?</h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {priceRangeOptions.map((option, index) => (
            <Button
              key={option}
              variant={selectedOptionStr === option ? "default" : "outline"}
              className={`justify-start text-left h-auto py-3 px-4 transition-all duration-200 hover:shadow-md ${
                selectedOptionStr === option 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
              } rounded-xl`}
              onClick={() => onSelect(option)}
            >
              <span className="mr-2 text-lg" aria-hidden="true">
                {priceRangeEmojis[index]}
              </span>
              <span className="font-medium">{option}</span>
            </Button>
          ))}
        </div>
        
        {(selectedOptionStr === 'Custom Range' || (typeof selectedOptionStr === 'string' && selectedOptionStr.startsWith('Custom:'))) && (
          <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-medium text-blue-700 mb-3">Drag the sliders to set your custom price range</p>
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

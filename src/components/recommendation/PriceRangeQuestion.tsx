
import React, { useEffect } from 'react';
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
  autoAdvance?: boolean;
  onAdvance?: () => void;
}

export const PriceRangeQuestion: React.FC<PriceRangeQuestionProps> = ({
  selectedOption,
  customMinPrice,
  customMaxPrice,
  onSelect,
  onRangeChange,
  autoAdvance = false,
  onAdvance
}) => {
  // Convert selectedOption to string for comparison if it's an array
  const selectedOptionStr = Array.isArray(selectedOption) 
    ? `Custom: USD ${selectedOption[0]} - ${selectedOption[1]}` 
    : selectedOption;

  // Add effect to advance when custom range is set
  useEffect(() => {
    if (autoAdvance && 
        onAdvance && 
        selectedOptionStr === 'Custom Range' && 
        customMinPrice && 
        customMaxPrice) {
      const timer = setTimeout(() => {
        // Auto-advance after the slider has been used AND values have been changed
        // This prevents auto-advancing immediately after selecting "Custom Range"
        if ((customMinPrice !== 500 || customMaxPrice !== 1500) && 
            selectedOptionStr === 'Custom Range') {
          onAdvance();
        }
      }, 1000); // Give user 1 second after changing range
      
      return () => clearTimeout(timer);
    }
  }, [customMinPrice, customMaxPrice, selectedOptionStr, autoAdvance, onAdvance]);

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">What is your price range?</h2>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {priceRangeOptions.map((option, index) => (
            <Button
              key={option}
              variant={selectedOptionStr === option ? "default" : "outline"}
              className={`justify-start text-left h-auto py-2.5 px-3.5 transition-all duration-200 hover:shadow-md ${
                selectedOptionStr === option 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
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
          <div className="mt-5 p-4 bg-blue-50/80 rounded-xl border border-blue-100">
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

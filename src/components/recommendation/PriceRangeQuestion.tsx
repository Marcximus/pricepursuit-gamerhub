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

  // Add effect to advance for normal options, but NOT for Custom Range or custom values
  useEffect(() => {
    // Only auto-advance when:
    // 1. autoAdvance is true
    // 2. onAdvance is defined
    // 3. The selectedOption isn't Custom Range
    // 4. The selectedOption doesn't start with 'Custom:'
    // 5. The selectedOption isn't empty (first load/reset)
    if (autoAdvance && 
        onAdvance && 
        selectedOptionStr !== 'Custom Range' && 
        !selectedOptionStr.startsWith('Custom:') &&
        selectedOptionStr !== '') {
      
      // Only auto-advance for preset price ranges, not for custom range
      const timer = setTimeout(() => {
        onAdvance();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedOptionStr, autoAdvance, onAdvance]);

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
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-white/80 hover:bg-green-50 text-gray-700 hover:text-green-600 border-gray-200'
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
          <div className="mt-5 p-4 bg-green-50/80 rounded-xl border border-green-100">
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

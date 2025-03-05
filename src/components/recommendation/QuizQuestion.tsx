
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizQuestionProps {
  question: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  emojis?: string[]; // Add optional emojis array prop
  stacked?: boolean; // Add option for stacked layout
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  options, 
  selected, 
  onSelect,
  emojis,
  stacked = false // Default to side-by-side layout
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">{question}</h2>
      <div className={`grid ${stacked ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3`}>
        {options.map((option, index) => (
          <Button
            key={option}
            variant={selected === option ? "default" : "outline"}
            className={`justify-start text-left h-auto py-2.5 px-3.5 transition-all duration-200 hover:shadow-md ${
              selected === option 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-white/80 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200'
            } rounded-xl`}
            onClick={() => onSelect(option)}
          >
            {emojis && emojis[index] && (
              <span className="mr-2 text-lg" aria-hidden="true">
                {emojis[index]}
              </span>
            )}
            <span className="font-medium">{option}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

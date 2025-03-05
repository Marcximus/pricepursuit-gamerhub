
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizQuestionProps {
  question: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  emojis?: string[]; // Add optional emojis array prop
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  options, 
  selected, 
  onSelect,
  emojis 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{question}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((option, index) => (
          <Button
            key={option}
            variant={selected === option ? "default" : "outline"}
            className="justify-start text-left h-auto py-3"
            onClick={() => onSelect(option)}
          >
            {emojis && emojis[index] && (
              <span className="mr-2 text-xl" aria-hidden="true">
                {emojis[index]}
              </span>
            )}
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

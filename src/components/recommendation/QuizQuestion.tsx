
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuizQuestionProps {
  question: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  emoji?: string; // New emoji prop
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  options, 
  selected, 
  onSelect,
  emoji = "💻" // Default emoji is a laptop
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label="question emoji">
          {emoji}
        </span>
        {question}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant={selected === option ? "default" : "outline"}
            className="justify-start text-left"
            onClick={() => onSelect(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
};

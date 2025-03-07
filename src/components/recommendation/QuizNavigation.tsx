
import React from 'react';
import { Button } from '@/components/ui/button';
import { Laptop, ArrowLeft, ArrowRight } from 'lucide-react';
import { QuizAnswers } from './types/quizTypes';

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: QuizAnswers;
  isProcessing: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const QuizNavigation: React.FC<QuizNavigationProps> = ({
  currentQuestion,
  totalQuestions,
  answers,
  isProcessing,
  onBack,
  onNext,
  onSubmit
}) => {
  const isNextDisabled = () => {
    switch (currentQuestion) {
      case 0: return !answers.usage;
      case 1: return !answers.priceRange;
      case 2: return !answers.brand;
      case 3: return !answers.screenSize;
      case 4: return !answers.graphics;
      default: return isProcessing;
    }
  };

  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentQuestion === 0 || isProcessing}
        className="px-5 py-2 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {currentQuestion < totalQuestions - 1 ? (
        <Button
          onClick={onNext}
          disabled={isNextDisabled()}
          className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition-all duration-200"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      ) : (
        <Button 
          onClick={onSubmit} 
          disabled={!answers.storage || isProcessing}
          className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 transition-all duration-200"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <Laptop className="w-5 h-5 mr-2" />
              Get Recommendations
            </>
          )}
        </Button>
      )}
    </div>
  );
};

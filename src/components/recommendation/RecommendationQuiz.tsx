import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { QuizQuestion } from './QuizQuestion';
import { PriceRangeQuestion } from './PriceRangeQuestion';
import { BrandSelection } from './BrandSelection';
import { QuizNavigation } from './QuizNavigation';
import { RecommendationResults } from './RecommendationResults';
import { useQuizState } from './hooks/useQuizState';
import { quizQuestions } from './config/quizConfig';
import { LoadingIndicator } from './LoadingIndicator';
import { useIsMobile } from '@/hooks/use-mobile';

interface RecommendationQuizProps {
  onResultsDisplayChange?: (isShowingResults: boolean) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const RecommendationQuiz: React.FC<RecommendationQuizProps> = ({ 
  onResultsDisplayChange,
  onProcessingChange
}) => {
  const {
    currentQuestion,
    answers,
    isProcessing,
    completed,
    results,
    error,
    progress,
    totalQuestions,
    handleOptionSelect,
    handlePriceRangeChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleReset
  } = useQuizState();

  const isMobile = useIsMobile();

  // Track if we're currently handling a back navigation
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);

  useEffect(() => {
    // Notify parent component when results are being shown
    if (onResultsDisplayChange) {
      onResultsDisplayChange(completed);
    }
  }, [completed, onResultsDisplayChange]);
  
  useEffect(() => {
    // Notify parent component when processing state changes
    if (onProcessingChange) {
      onProcessingChange(isProcessing);
    }
  }, [isProcessing, onProcessingChange]);

  // Auto-advance handler for options
  const handleOptionSelectAndAdvance = (question: keyof typeof answers, value: string) => {
    handleOptionSelect(question, value);
    
    // Don't auto-advance if we're navigating back
    if (isNavigatingBack) {
      setIsNavigatingBack(false);
      return;
    }
    
    // Don't auto-advance on the last question
    if (currentQuestion < totalQuestions - 1) {
      // Special case: For price range, don't auto-advance if selecting "Custom Range"
      if (question === 'priceRange' && (value === 'Custom Range' || value.startsWith('Custom:'))) {
        return; // Don't auto-advance for custom options
      }
      
      // Small delay to show the selection before advancing
      setTimeout(() => {
        handleNext();
      }, 300);
    }
  };

  // Override the back handler to set the navigating back flag
  const handleBackWithFlag = () => {
    setIsNavigatingBack(true);
    handleBack();
  };

  // If completed, show results
  if (completed) {
    return <RecommendationResults results={results} onReset={handleReset} />;
  }

  return (
    <div className={`max-w-2xl mx-auto ${isMobile ? 'px-4' : ''}`}>
      <Card className={`p-4 md:p-6 mb-6 bg-white/90 shadow-sm border-2 border-blue-200 rounded-xl ${isMobile ? 'mx-0' : ''}`}>
        {isProcessing ? (
          <LoadingIndicator isLoading={isProcessing} />
        ) : (
          <>
            {currentQuestion === 0 && (
              <QuizQuestion 
                question={quizQuestions[0].question}
                options={quizQuestions[0].options}
                selected={answers.usage}
                onSelect={(value) => handleOptionSelectAndAdvance('usage', value)}
                emojis={quizQuestions[0].emojis}
              />
            )}

            {currentQuestion === 1 && (
              <PriceRangeQuestion
                selectedOption={answers.priceRange}
                customMinPrice={answers.customMinPrice || 500}
                customMaxPrice={answers.customMaxPrice || 1500}
                onSelect={(value) => handleOptionSelect('priceRange', value)}
                onRangeChange={handlePriceRangeChange}
                autoAdvance={!isNavigatingBack} // Disable auto-advance when navigating back
                onAdvance={handleNext}
              />
            )}

            {currentQuestion === 2 && (
              <BrandSelection 
                selectedBrand={answers.brand}
                onSelect={(value) => handleOptionSelectAndAdvance('brand', value)}
              />
            )}

            {currentQuestion === 3 && (
              <QuizQuestion 
                question={quizQuestions[3].question}
                options={quizQuestions[3].options}
                selected={answers.screenSize}
                onSelect={(value) => handleOptionSelectAndAdvance('screenSize', value)}
                emojis={quizQuestions[3].emojis}
                stacked={true} // Stack options for screen size question
              />
            )}

            {currentQuestion === 4 && (
              <QuizQuestion 
                question={quizQuestions[4].question}
                options={quizQuestions[4].options}
                selected={answers.graphics}
                onSelect={(value) => handleOptionSelectAndAdvance('graphics', value)}
                emojis={quizQuestions[4].emojis}
                stacked={true} // Stack options for graphics question
              />
            )}

            {currentQuestion === 5 && (
              <QuizQuestion 
                question={quizQuestions[5].question}
                options={quizQuestions[5].options}
                selected={answers.storage}
                onSelect={(value) => handleOptionSelect('storage', value)}
                emojis={quizQuestions[5].emojis}
                stacked={true} // Stack options for storage question
              />
            )}
          </>
        )}
      </Card>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <QuizNavigation 
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        answers={answers}
        isProcessing={isProcessing}
        onBack={handleBackWithFlag}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default RecommendationQuiz;

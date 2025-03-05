
import React, { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { QuizQuestion } from './QuizQuestion';
import { PriceRangeQuestion } from './PriceRangeQuestion';
import { QuizNavigation } from './QuizNavigation';
import { RecommendationResults } from './RecommendationResults';
import { useQuizState } from './hooks/useQuizState';
import { quizQuestions } from './config/quizConfig';
import { LoadingIndicator } from './LoadingIndicator';

interface RecommendationQuizProps {
  onResultsDisplayChange?: (isShowingResults: boolean) => void;
}

const RecommendationQuiz: React.FC<RecommendationQuizProps> = ({ onResultsDisplayChange }) => {
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

  useEffect(() => {
    // Notify parent component when results are being shown
    if (onResultsDisplayChange) {
      onResultsDisplayChange(completed);
    }
  }, [completed, onResultsDisplayChange]);

  // If completed, show results
  if (completed) {
    return <RecommendationResults results={results} onReset={handleReset} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">Question {currentQuestion + 1} of {totalQuestions}</span>
          <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-100 rounded-full overflow-hidden" />
      </div>

      <Card className="p-8 mb-6 bg-white shadow-sm border-gray-100 rounded-2xl">
        {isProcessing ? (
          <LoadingIndicator isLoading={isProcessing} />
        ) : (
          <>
            {currentQuestion === 0 && (
              <QuizQuestion 
                question={quizQuestions[0].question}
                options={quizQuestions[0].options}
                selected={answers.usage}
                onSelect={(value) => handleOptionSelect('usage', value)}
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
              />
            )}

            {currentQuestion === 2 && (
              <QuizQuestion 
                question={quizQuestions[2].question}
                options={quizQuestions[2].options}
                selected={answers.brand}
                onSelect={(value) => handleOptionSelect('brand', value)}
                emojis={quizQuestions[2].emojis}
              />
            )}

            {currentQuestion === 3 && (
              <QuizQuestion 
                question={quizQuestions[3].question}
                options={quizQuestions[3].options}
                selected={answers.screenSize}
                onSelect={(value) => handleOptionSelect('screenSize', value)}
                emojis={quizQuestions[3].emojis}
                stacked={true} // Stack options for screen size question
              />
            )}

            {currentQuestion === 4 && (
              <QuizQuestion 
                question={quizQuestions[4].question}
                options={quizQuestions[4].options}
                selected={answers.graphics}
                onSelect={(value) => handleOptionSelect('graphics', value)}
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
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default RecommendationQuiz;

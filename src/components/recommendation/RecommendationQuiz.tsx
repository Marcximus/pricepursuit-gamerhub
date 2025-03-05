
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { QuizQuestion } from './QuizQuestion';
import { PriceRangeQuestion } from './PriceRangeQuestion';
import { QuizNavigation } from './QuizNavigation';
import { RecommendationResults } from './RecommendationResults';
import { useQuizState } from './hooks/useQuizState';
import { quizQuestions } from './config/quizConfig';
import { LoadingIndicator } from './LoadingIndicator';

const RecommendationQuiz = () => {
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

  // If completed, show results
  if (completed) {
    return <RecommendationResults results={results} onReset={handleReset} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-gray-500 text-right">Question {currentQuestion + 1} of {totalQuestions}</p>
      </div>

      <Card className="p-6 mb-6 bg-white shadow-sm">
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
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
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

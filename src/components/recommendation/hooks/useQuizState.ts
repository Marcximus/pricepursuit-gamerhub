
import { useState } from 'react';
import { QuizAnswers, RecommendationResult } from '../types/quizTypes';

export const useQuizState = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    usage: '',
    priceRange: '',
    customMinPrice: 500,
    customMaxPrice: 1500,
    brand: '',
    screenSize: '',
    graphics: '',
    storage: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalQuestions = 6;
  const progress = ((currentQuestion) / totalQuestions) * 100;

  const handleOptionSelect = (question: keyof QuizAnswers, answer: string) => {
    setAnswers({ ...answers, [question]: answer });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setAnswers({ 
      ...answers, 
      customMinPrice: min, 
      customMaxPrice: max,
      priceRange: `Custom: USD ${min} - ${max}`
    });
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Format price range for API request
      let priceRange = answers.priceRange;
      if (answers.priceRange === 'Custom Range' || answers.priceRange.startsWith('Custom:')) {
        priceRange = `USD ${answers.customMinPrice} - ${answers.customMaxPrice}`;
      }
      
      // Prepare final answers
      const finalAnswers = {
        usage: answers.usage,
        priceRange: priceRange,
        brand: answers.brand,
        screenSize: answers.screenSize,
        graphics: answers.graphics,
        storage: answers.storage
      };

      const response = await fetch('/functions/v1/laptop-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: finalAnswers })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      setResults(data.data);
      setCompleted(true);
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({
      usage: '',
      priceRange: '',
      customMinPrice: 500,
      customMaxPrice: 1500,
      brand: '',
      screenSize: '',
      graphics: '',
      storage: ''
    });
    setCompleted(false);
    setResults(null);
    setError(null);
  };

  return {
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
  };
};

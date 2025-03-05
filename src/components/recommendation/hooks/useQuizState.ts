
import { useState } from 'react';
import { QuizAnswers, RecommendationResult } from '../types/quizTypes';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

      console.log("Sending answers to API:", finalAnswers);
      
      toast.info("Getting laptop recommendations...");
      
      // Use Supabase client to call the function
      const { data, error: functionError } = await supabase.functions.invoke('laptop-recommendation', {
        body: { answers: finalAnswers }
      });
      
      if (functionError) {
        console.error("Function error:", functionError);
        throw new Error(`API error: ${functionError.message || 'Unknown error'}`);
      }
      
      console.log("API response:", data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get recommendations');
      }
      
      setResults(data.data);
      setCompleted(true);
      toast.success("Recommendations ready!");
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      toast.error("Could not get recommendations");
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

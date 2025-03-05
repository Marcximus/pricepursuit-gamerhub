
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Laptop } from 'lucide-react';
import { PriceRangeSlider } from './PriceRangeSlider';
import { QuizQuestion } from './QuizQuestion';
import { RecommendationResults } from './RecommendationResults';

// Question types and configuration
const usageOptions = [
  'School/Education', 
  'Business/Office Work', 
  'Video Editing',
  'Photo Editing', 
  'AI/Machine Learning', 
  'Gaming', 
  'Programming/Coding',
  'Web Browsing/Everyday Use',
  'Content Creation',
  '3D Modeling/CAD'
];

const priceRangeOptions = [
  'USD 100 - 300',
  'USD 300 - 600',
  'USD 600 - 900',
  'USD 900 - 1200',
  'USD 1200 - 1500',
  'USD 1500 - 2000',
  'USD 2000 - 2500',
  'USD 3000 - 4000',
  'USD 4000 - 6000',
  'Custom Range'
];

const brandOptions = [
  'No preference',
  'Dell',
  'HP',
  'Lenovo',
  'Apple',
  'ASUS',
  'Acer',
  'MSI',
  'Microsoft Surface',
  'Samsung',
  'Razer',
  'LG',
  'Gigabyte',
  'Toshiba'
];

const screenSizeOptions = [
  '13 inches or smaller (ultra-portable)',
  '14–15 inches (balanced)',
  '17 inches or larger (desktop replacement)'
];

const graphicsOptions = [
  'Integrated graphics (basic tasks)',
  'Dedicated GPU (gaming, design, video editing)',
  'High-end GPU (advanced rendering, AAA gaming)'
];

const storageOptions = [
  'Not much (200 GB - 500GB)',
  'I need a bit (500 GB - 1000GB)',
  'I need a lot (1000GB - 8000GB)'
];

const RecommendationQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({
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
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const totalQuestions = 6;
  const progress = ((currentQuestion) / totalQuestions) * 100;

  const handleOptionSelect = (question, answer) => {
    setAnswers({ ...answers, [question]: answer });
  };

  const handlePriceRangeChange = (min, max) => {
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
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the quiz
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
        {currentQuestion === 0 && (
          <QuizQuestion 
            question="What are you going to use it for?"
            options={usageOptions}
            selected={answers.usage}
            onSelect={(value) => handleOptionSelect('usage', value)}
          />
        )}

        {currentQuestion === 1 && (
          <>
            <h2 className="text-xl font-semibold mb-4">What is your price range?</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {priceRangeOptions.map((option) => (
                  <Button
                    key={option}
                    variant={answers.priceRange === option ? "default" : "outline"}
                    className="justify-start text-left"
                    onClick={() => handleOptionSelect('priceRange', option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              {(answers.priceRange === 'Custom Range' || answers.priceRange.startsWith('Custom:')) && (
                <div className="mt-4">
                  <PriceRangeSlider 
                    minPrice={answers.customMinPrice} 
                    maxPrice={answers.customMaxPrice}
                    onChange={handlePriceRangeChange}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {currentQuestion === 2 && (
          <QuizQuestion 
            question="Do you have a preferred brand?"
            options={brandOptions}
            selected={answers.brand}
            onSelect={(value) => handleOptionSelect('brand', value)}
          />
        )}

        {currentQuestion === 3 && (
          <QuizQuestion 
            question="What is your desired screen size?"
            options={screenSizeOptions}
            selected={answers.screenSize}
            onSelect={(value) => handleOptionSelect('screenSize', value)}
          />
        )}

        {currentQuestion === 4 && (
          <QuizQuestion 
            question="What are your graphics requirements?"
            options={graphicsOptions}
            selected={answers.graphics}
            onSelect={(value) => handleOptionSelect('graphics', value)}
          />
        )}

        {currentQuestion === 5 && (
          <QuizQuestion 
            question="What's your storage preference?"
            options={storageOptions}
            selected={answers.storage}
            onSelect={(value) => handleOptionSelect('storage', value)}
          />
        )}
      </Card>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentQuestion === 0 || isProcessing}
        >
          Back
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={handleNext}
            disabled={
              (currentQuestion === 0 && !answers.usage) ||
              (currentQuestion === 1 && !answers.priceRange) ||
              (currentQuestion === 2 && !answers.brand) ||
              (currentQuestion === 3 && !answers.screenSize) ||
              (currentQuestion === 4 && !answers.graphics) ||
              isProcessing
            }
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit} 
            disabled={!answers.storage || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
};

export default RecommendationQuiz;

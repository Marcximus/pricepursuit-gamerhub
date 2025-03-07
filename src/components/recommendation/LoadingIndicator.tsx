
import React, { useEffect, useState } from 'react';
import { Laptop, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

// Array of funny loading messages
const funnyLoadingTexts = [
  "Training hamsters to compare laptops...",
  "Calculating performance-to-RGB-lighting ratio...",
  "Converting caffeine into laptop recommendations...",
  "Asking gamers which laptop is cooler...",
  "Measuring laptop weight in bananas...",
  "Checking if it can run Crysis...",
  "Translating technical jargon to English...",
  "Consulting with tech wizards...",
  "Determining which laptop survives coffee spills better...",
  "Figuring out laptop battery life in Netflix episodes...",
  "Benchmarking laptops against a toaster...",
  "Counting pixels one by one...",
  "Asking ChatGPT which laptop it would date...",
  "Calculating how many browser tabs each laptop can handle...",
  "Measuring performance in units of 90s dial-up connections...",
  "Checking if either laptop can make a decent cup of coffee...",
  "Determining how many cat videos can be watched simultaneously...",
  "Converting specs into emoji explanations...",
  "Asking both laptops to solve world peace...",
  "Testing if either laptop floats (don't try this at home)...",
  "Calculating price-to-cool-factor ratio...",
  "Determining which laptop makes you look smarter in coffee shops...",
  "Measuring battery life in Zoom meetings..."
];

// Function to shuffle array using Fisher-Yates algorithm
const shuffleArray = (array: string[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  const [progress, setProgress] = useState(5);
  const [textIndex, setTextIndex] = useState(0);
  const [shuffledTexts, setShuffledTexts] = useState<string[]>([]);

  // Initialize shuffled texts on first render
  useEffect(() => {
    setShuffledTexts(shuffleArray(funnyLoadingTexts));
  }, []);
  
  useEffect(() => {
    // Rotate through funny loading texts
    const textTimer = setInterval(() => {
      setTextIndex(prev => (prev + 1) % shuffledTexts.length);
    }, 3000);
    
    return () => clearInterval(textTimer);
  }, [shuffledTexts]);
  
  useEffect(() => {
    // Progress animation effect
    const timer = setTimeout(() => {
      setProgress(prev => {
        // Random increment with occasional jumps
        const randomFactor = Math.random() * 1.6 + 0.4; // Random factor between 0.4 and 2.0
        const increment = Math.max(1.6, Math.floor((40 / (prev + 5)) * randomFactor * 0.76));
        
        // Add occasional jumps for more randomness
        const shouldJump = Math.random() > 0.85;
        const jumpValue = shouldJump ? Math.floor(Math.random() * 6) + 2 : 0;
        
        return prev >= 90 ? 90 : Math.min(90, prev + increment + jumpValue);
      });
    }, 750);
    
    return () => clearTimeout(timer);
  }, [progress]);

  if (!isLoading) return null;
  
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <Laptop className="w-16 h-16 text-green-500" />
        <RefreshCw className="w-8 h-8 text-green-700 absolute -right-2 -top-2 animate-spin" />
      </div>
      <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800">Finding the perfect laptops for you...</h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">
        We're searching through our database to find the best laptops that match your requirements.
      </p>
      
      <div className="w-full max-w-md">
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-green-100">
            <div 
              className="w-full h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
              style={{ transform: `translateX(-${100 - progress}%)` }}
            ></div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-2 italic">
        {shuffledTexts.length > 0 ? shuffledTexts[textIndex] : "Analyzing laptops..."}
      </p>
    </div>
  );
};

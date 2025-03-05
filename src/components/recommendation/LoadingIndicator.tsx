
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

const loadingMessages = [
  "Scouring the internet for the perfect laptop...",
  "Comparing specs and benchmarks...",
  "Checking prices across multiple retailers...",
  "Analyzing your requirements...",
  "Consulting with digital laptop experts...",
  "Running advanced matching algorithms...",
  "Filtering out the not-so-great options...",
  "Applying secret laptop finding techniques...",
  "Almost there! Ranking your top matches...",
  "Preparing your personalized recommendations..."
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  const [progressValue, setProgressValue] = useState(10);
  const [messageIndex, setMessageIndex] = useState(0);
  
  useEffect(() => {
    if (!isLoading) {
      setProgressValue(10);
      setMessageIndex(0);
      return;
    }
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgressValue((prev) => {
        // Cap at 95% to give impression of waiting for completion
        return prev >= 95 ? 95 : prev + 5;
      });
    }, 700);
    
    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div className="w-full space-y-4 py-4">
      <Progress value={progressValue} className="h-2" />
      <p className="text-center text-gray-600 animate-pulse">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

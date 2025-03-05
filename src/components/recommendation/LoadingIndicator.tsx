
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

const loadingMessages = [
  "Asking ChatGPT which laptops are its favorites...",
  "Waking up the laptop gnomes who live in our servers...",
  "Bribing the CPU gods with extra thermal paste...",
  "Consulting with cats walking across keyboards for recommendations...",
  "Checking if any laptops can run Crysis (still the benchmark in 2024)...",
  "Exploring the dark web for secret gaming laptop deals...",
  "Arguing with AI about whether Macs are real computers...",
  "Telling the RGB lighting to calm down so we can see the specs...",
  "Calculating how many browser tabs this laptop can handle before crying...",
  "Measuring laptop weight against a banana for scale...",
  "Converting specs from nerd-speak to human language...",
  "Checking if any laptops can survive being used as a dinner tray...",
  "Determining which laptop has the most intimidating startup sound...",
  "Finding laptops thin enough to slice cheese but thick enough to not bend...",
  "Testing which laptop fans are quiet enough for 3AM gaming sessions...",
  "Counting how many coffees you can spill before warranty is void...",
  "Consulting with professional lap-warmers about heat management...",
  "Measuring battery life in Netflix episodes rather than hours..."
];

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoading }) => {
  const [progressValue, setProgressValue] = useState(10);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    if (!isLoading) {
      setProgressValue(10);
      setMessage("");
      return;
    }
    
    // Set initial random message
    setMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgressValue((prev) => {
        // Cap at 95% to give impression of waiting for completion
        return prev >= 95 ? 95 : prev + 5;
      });
    }, 700);
    
    // Message rotation - randomly select a new message every few seconds
    const messageInterval = setInterval(() => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * loadingMessages.length);
      } while (loadingMessages[newIndex] === message && loadingMessages.length > 1);
      
      setMessage(loadingMessages[newIndex]);
    }, 3000);
    
    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isLoading, message]);
  
  if (!isLoading) return null;
  
  return (
    <div className="w-full space-y-4 py-4">
      <Progress value={progressValue} className="h-2" />
      <p className="text-center text-gray-600 animate-pulse">
        {message}
      </p>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";

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

const LoadingState: React.FC = () => {
  const [progress, setProgress] = useState(5);
  const [textIndex, setTextIndex] = useState(0);
  
  useEffect(() => {
    // Rotate through funny loading texts
    const textTimer = setInterval(() => {
      setTextIndex(prev => (prev + 1) % funnyLoadingTexts.length);
    }, 3000);
    
    return () => clearInterval(textTimer);
  }, []);
  
  useEffect(() => {
    // Slower progress (20% slower) with more random increments
    const timer = setTimeout(() => {
      setProgress(prev => {
        // More random increments with lower speed (20% slower)
        const randomFactor = Math.random() * 1.6 + 0.4; // Random factor between 0.4 and 2.0
        const increment = Math.max(1.6, Math.floor((40 / (prev + 5)) * randomFactor * 0.8)); // Multiply by 0.8 for 20% slower
        
        // Add occasional jumps for more randomness
        const shouldJump = Math.random() > 0.85;
        const jumpValue = shouldJump ? Math.floor(Math.random() * 6) + 2 : 0; // Smaller jumps
        
        return prev >= 90 ? 90 : Math.min(90, prev + increment + jumpValue);
      });
    }, 720); // 20% increase from previous delay of 600ms
    
    return () => clearTimeout(timer);
  }, [progress]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mb-6 space-y-3">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Loader className="w-5 h-5 animate-spin" />
          <span className="font-medium">Analyzing laptops...</span>
        </div>
        <Progress value={progress} className="w-full h-2" indicatorClassName="bg-primary" />
        <p className="text-sm text-muted-foreground">{funnyLoadingTexts[textIndex]}</p>
      </div>
      
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};

export default LoadingState;

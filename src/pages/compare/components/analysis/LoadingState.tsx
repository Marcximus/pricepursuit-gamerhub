
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";

const LoadingState: React.FC = () => {
  const [progress, setProgress] = useState(5);
  
  useEffect(() => {
    // Faster (2x) progress with more random increments
    const timer = setTimeout(() => {
      setProgress(prev => {
        // More random increments with higher speed (2x faster)
        const randomFactor = Math.random() * 2 + 0.5; // Random factor between 0.5 and 2.5
        const increment = Math.max(2, Math.floor((40 / (prev + 5)) * randomFactor));
        
        // Add occasional jumps for more randomness
        const shouldJump = Math.random() > 0.85;
        const jumpValue = shouldJump ? Math.floor(Math.random() * 8) + 3 : 0;
        
        return prev >= 90 ? 90 : Math.min(90, prev + increment + jumpValue);
      });
    }, 600); // Half the delay (was 1200ms)
    
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
        <p className="text-sm text-muted-foreground">AI is comparing the specifications and value</p>
      </div>
      
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
};

export default LoadingState;


import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";

const LoadingState: React.FC = () => {
  const [progress, setProgress] = useState(10);
  
  useEffect(() => {
    // Simulate progress
    const timer = setTimeout(() => {
      setProgress(prev => {
        // Increase progress but cap at 90% since we don't know actual completion
        return prev >= 90 ? 90 : prev + 10;
      });
    }, 800);
    
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

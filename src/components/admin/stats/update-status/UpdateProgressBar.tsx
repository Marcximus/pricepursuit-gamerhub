
import React from "react";
import { Progress } from "@/components/ui/progress";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface UpdateProgressBarProps {
  stats: DatabaseStats;
}

export function UpdateProgressBar({ stats }: UpdateProgressBarProps) {
  // Calculate proper percentage for the progress bar
  const calculateProgressPercentage = (): number => {
    // If there are pending or in-progress updates, we need to show some progress
    const totalInQueue = stats.updateStatus.pendingUpdate.count + stats.updateStatus.inProgress.count;
    
    if (stats.updateStatus.completed.count === 0 && totalInQueue === 0) {
      return 0;
    }
    
    // Calculate based on completed vs total in the pipeline
    const total = stats.updateStatus.completed.count + totalInQueue + stats.updateStatus.error.count;
    
    // Prevent division by zero
    if (total === 0) return 0;
    
    const percentage = (stats.updateStatus.completed.count / total) * 100;
    
    // Return at least 5% if we have active updates but no completions yet
    return stats.updateStatus.inProgress.count > 0 && percentage === 0 ? 5 : percentage;
  };

  const progressPercentage = calculateProgressPercentage();

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm">Update Progress</span>
        <span className="text-sm font-medium">
          {stats.updateStatus.completed.count} / {stats.totalLaptops} 
          ({Math.round(progressPercentage)}%)
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-2"
        indicatorClassName={`${
          progressPercentage >= 75 ? 'bg-green-500' : 
          progressPercentage >= 50 ? 'bg-blue-500' : 
          progressPercentage >= 25 ? 'bg-amber-500' : 
          'bg-red-500'
        }`}
      />
    </div>
  );
}

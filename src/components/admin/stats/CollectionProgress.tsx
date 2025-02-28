
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface CollectionProgressProps {
  isCollecting: boolean;
  progress: {
    currentGroup: number;
    totalGroups: number;
    currentBrand: number;
    brandsInCurrentGroup: number;
    stats: {
      processed: number;
      added: number;
      updated: number;
      failed: number;
      skipped: number;
    };
  } | null;
}

export const CollectionProgress: React.FC<CollectionProgressProps> = ({
  isCollecting,
  progress
}) => {
  if (!isCollecting) {
    return null;
  }

  if (!progress) {
    return (
      <div className="mt-4 p-4 border rounded-md bg-slate-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Initializing collection process...</span>
        </div>
      </div>
    );
  }

  const { currentGroup, totalGroups, currentBrand, brandsInCurrentGroup, stats } = progress;
  
  // Calculate overall progress percentage
  const groupProgress = ((currentGroup - 1) / totalGroups) * 100;
  const brandContribution = (currentBrand / brandsInCurrentGroup) * (100 / totalGroups);
  const overallProgress = Math.min(Math.round(groupProgress + brandContribution), 100);
  
  return (
    <div className="mt-4 p-4 border rounded-md bg-slate-50">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="font-medium text-sm">Collection in Progress</h3>
        <span className="text-xs font-medium text-slate-500">
          {overallProgress}% Complete
        </span>
      </div>
      
      <Progress value={overallProgress} className="h-2 mb-4" />
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Group:</span>
          <span className="font-medium">{currentGroup} of {totalGroups}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Brand:</span>
          <span className="font-medium">{currentBrand} of {brandsInCurrentGroup}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Processed:</span>
          <span className="font-medium">{stats.processed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Added:</span>
          <span className="font-medium text-green-600">{stats.added}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Updated:</span>
          <span className="font-medium text-blue-600">{stats.updated}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Failed:</span>
          <span className="font-medium text-red-600">{stats.failed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Skipped:</span>
          <span className="font-medium text-amber-600">{stats.skipped}</span>
        </div>
      </div>
    </div>
  );
};

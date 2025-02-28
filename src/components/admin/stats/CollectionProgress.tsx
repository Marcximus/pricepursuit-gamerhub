
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Initializing collection process...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { currentGroup, totalGroups, currentBrand, brandsInCurrentGroup, stats } = progress;
  
  // Calculate overall progress percentage
  const groupProgress = ((currentGroup - 1) / totalGroups) * 100;
  const brandContribution = (currentBrand / brandsInCurrentGroup) * (100 / totalGroups);
  const overallProgress = Math.min(Math.round(groupProgress + brandContribution), 100);
  
  // Calculate stats percentage
  const totalProcessed = stats.processed > 0 ? stats.processed : 1; // Avoid division by zero
  const addedPercentage = (stats.added / totalProcessed) * 100;
  const updatedPercentage = (stats.updated / totalProcessed) * 100;
  const failedPercentage = (stats.failed / totalProcessed) * 100;
  const skippedPercentage = (stats.skipped / totalProcessed) * 100;
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Collection in Progress</span>
          <Badge variant="outline" className="font-normal">
            {overallProgress}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={overallProgress} className="h-2 mb-4" />
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Group Progress:</span>
            <span className="font-medium">{currentGroup} of {totalGroups}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Brand Progress:</span>
            <span className="font-medium">{currentBrand} of {brandsInCurrentGroup}</span>
          </div>
          
          <div className="col-span-2 h-px bg-slate-100 my-1"></div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Processed:</span>
            <span className="font-medium">{stats.processed}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
              <span className="text-slate-500">Added:</span>
            </div>
            <span className="font-medium text-green-600">{stats.added} 
              <span className="text-xs text-slate-400 ml-1">({Math.round(addedPercentage)}%)</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></div>
              <span className="text-slate-500">Updated:</span>
            </div>
            <span className="font-medium text-blue-600">{stats.updated}
              <span className="text-xs text-slate-400 ml-1">({Math.round(updatedPercentage)}%)</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
              <span className="text-slate-500">Failed:</span>
            </div>
            <span className="font-medium text-red-600">{stats.failed}
              <span className="text-xs text-slate-400 ml-1">({Math.round(failedPercentage)}%)</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></div>
              <span className="text-slate-500">Skipped:</span>
            </div>
            <span className="font-medium text-amber-600">{stats.skipped}
              <span className="text-xs text-slate-400 ml-1">({Math.round(skippedPercentage)}%)</span>
            </span>
          </div>
          
          {stats.processed > 0 && (
            <div className="col-span-2 mt-2">
              <div className="w-full h-1.5 bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${addedPercentage}%` }}></div>
                <div className="h-full bg-blue-500" style={{ width: `${updatedPercentage}%` }}></div>
                <div className="h-full bg-red-500" style={{ width: `${failedPercentage}%` }}></div>
                <div className="h-full bg-amber-500" style={{ width: `${skippedPercentage}%` }}></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

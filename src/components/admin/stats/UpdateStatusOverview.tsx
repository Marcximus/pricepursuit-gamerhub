
import React, { useContext, useEffect, useState } from "react";
import { CircleCheck, Clock, CircleAlert, RotateCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatItem } from "./StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { StatsRefreshContext } from "@/components/admin/LaptopStats";
import { Button } from "@/components/ui/button";

interface UpdateStatusOverviewProps {
  stats: DatabaseStats;
}

export function UpdateStatusOverview({ stats }: UpdateStatusOverviewProps) {
  // Get the refresh function from context to allow manual refresh
  const refreshStats = useContext(StatsRefreshContext);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Setup automatic refresh for the component
  useEffect(() => {
    // Update the last refreshed time whenever stats change
    setLastUpdatedTime(new Date().toLocaleTimeString());
    
    // Set up interval to refresh more frequently when updates are in progress
    const hasActiveUpdates = stats.updateStatus.inProgress.count > 0;
    const refreshInterval = hasActiveUpdates ? 5000 : 15000; // 5 seconds during active updates, otherwise 15 seconds
    
    console.log(`Setting up refresh interval: ${refreshInterval}ms, active updates: ${hasActiveUpdates}`);
    
    const interval = setInterval(() => {
      if (refreshStats) {
        console.log("Auto-refreshing update status...");
        refreshStats();
      }
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [stats.updateStatus.inProgress.count, refreshStats]);

  // Handle manual refresh click
  const handleRefresh = async () => {
    if (refreshStats && !isRefreshing) {
      setIsRefreshing(true);
      console.log("Manual refresh triggered");
      try {
        await refreshStats();
        setLastUpdatedTime(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Error refreshing stats:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Calculate proper percentage for the progress bar
  const calculateProgressPercentage = (): number => {
    // If there are pending or in-progress updates, we need to show some progress
    const totalInQueue = stats.updateStatus.pendingUpdate.count + stats.updateStatus.inProgress.count;
    
    if (stats.updateStatus.completed.count === 0 && totalInQueue === 0) {
      return 0;
    }
    
    // Calculate based on completed vs total in the pipeline
    const total = stats.updateStatus.completed.count + totalInQueue + stats.updateStatus.error.count;
    const percentage = (stats.updateStatus.completed.count / total) * 100;
    
    // Return at least 5% if we have active updates but no completions yet
    return stats.updateStatus.inProgress.count > 0 && percentage === 0 ? 5 : percentage;
  };

  const progressPercentage = calculateProgressPercentage();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Update Status</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="text-xs"
        >
          <RotateCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="text-sm font-medium mb-2">Update Pipeline</h4>
          <div className="space-y-2">
            <StatItem 
              icon={<Clock className="h-4 w-4 text-slate-500" />}
              label="Pending Update"
              value={stats.updateStatus.pendingUpdate.count}
            />
            
            <StatItem 
              icon={<RotateCw className={`h-4 w-4 text-blue-500 ${stats.updateStatus.inProgress.count > 0 ? 'animate-spin' : ''}`} />}
              label="In Progress"
              value={stats.updateStatus.inProgress.count}
            />
            
            <StatItem 
              icon={<CircleCheck className="h-4 w-4 text-green-500" />}
              label="Completed"
              value={stats.updateStatus.completed.count}
            />
            
            <StatItem 
              icon={<CircleAlert className="h-4 w-4 text-red-500" />}
              label="Error"
              value={stats.updateStatus.error.count}
            />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="text-sm font-medium mb-2">Update Timeline</h4>
          <div className="space-y-2">
            <StatItem 
              icon={<Clock className="h-4 w-4 text-amber-500" />}
              label="Not Updated (24h)"
              value={stats.updateStatus.notUpdated.count}
            />
            
            <StatItem 
              icon={<Clock className="h-4 w-4 text-amber-500" />}
              label="Not Checked (24h)"
              value={stats.updateStatus.notChecked.count}
            />
            
            <StatItem 
              icon={<CircleCheck className="h-4 w-4 text-green-500" />}
              label="Updated (Last 24h)"
              value={stats.updateStatus.updatedLast24h.count}
            />
            
            <StatItem 
              icon={<CircleCheck className="h-4 w-4 text-green-500" />}
              label="Updated (Last 7d)"
              value={stats.updateStatus.updatedLast7d.count}
            />
          </div>
        </div>
      </div>
      
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

      <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Active updates:</span> {stats.updateStatus.inProgress.count}
            {stats.updateStatus.inProgress.count > 0 && (
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                Updating
              </span>
            )}
          </div>
          <div>
            <span className="opacity-75">Last refresh: {lastUpdatedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

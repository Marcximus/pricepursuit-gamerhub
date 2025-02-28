
import React, { useState } from "react";
import { RotateCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { resetStalePendingUpdates } from "@/utils/laptop/stats/updateStatusQueries";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface UpdateStatusActionsProps {
  stats: DatabaseStats;
  refreshStats: () => Promise<void>;
}

export function UpdateStatusActions({ stats, refreshStats }: UpdateStatusActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const { toast } = useToast();

  // Check for stuck updates
  const hasStuckUpdates = stats.updateStatus.inProgress.count > 0 && 
                          stats.updateStatus.completed.count === 0 && 
                          stats.updateStatus.updatedLast24h.count === 0;

  // Handle manual refresh click
  const handleRefresh = async () => {
    if (refreshStats && !isRefreshing) {
      setIsRefreshing(true);
      console.log("Manual refresh triggered");
      try {
        await refreshStats();
        toast({
          title: "Update Status Refreshed",
          description: "Statistics have been updated from the database",
        });
      } catch (error) {
        console.error("Error refreshing stats:", error);
        toast({
          title: "Refresh Failed",
          description: "Could not refresh update statistics",
          variant: "destructive"
        });
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Handle resetting stuck updates
  const handleResetStuckUpdates = async () => {
    if (!isResetting) {
      setIsResetting(true);
      try {
        console.log("Resetting stuck updates");
        await resetStalePendingUpdates();
        toast({
          title: "Reset Completed",
          description: "Stuck updates have been reset",
        });
        
        // Refresh stats after reset
        if (refreshStats) {
          await refreshStats();
        }
      } catch (error) {
        console.error("Error resetting stuck updates:", error);
        toast({
          title: "Reset Failed",
          description: "Could not reset stuck updates",
          variant: "destructive"
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="flex space-x-2">
      {hasStuckUpdates && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleResetStuckUpdates} 
          disabled={isResetting}
          className="text-xs"
        >
          <AlertCircle className={`h-3 w-3 mr-1 ${isResetting ? 'animate-spin' : ''}`} />
          {isResetting ? 'Resetting...' : 'Reset Stuck Updates'}
        </Button>
      )}
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
  );
}

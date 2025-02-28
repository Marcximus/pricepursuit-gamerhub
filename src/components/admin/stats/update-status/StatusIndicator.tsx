
import React from "react";
import { RotateCw, AlertCircle } from "lucide-react";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface StatusIndicatorProps {
  stats: DatabaseStats;
  lastUpdatedTime: string;
}

export function StatusIndicator({ stats, lastUpdatedTime }: StatusIndicatorProps) {
  // Check for stuck updates
  const hasStuckUpdates = stats.updateStatus.inProgress.count > 0 && 
                        stats.updateStatus.completed.count === 0 && 
                        stats.updateStatus.updatedLast24h.count === 0;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border text-xs text-gray-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-medium">Active updates:</span> {stats.updateStatus.inProgress.count}
          {stats.updateStatus.inProgress.count > 0 && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <RotateCw className="h-3 w-3 mr-1 animate-spin" />
              Updating
            </span>
          )}
          {hasStuckUpdates && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Stuck
            </span>
          )}
        </div>
        <div>
          <span className="opacity-75">Last refresh: {lastUpdatedTime}</span>
        </div>
      </div>
    </div>
  );
}

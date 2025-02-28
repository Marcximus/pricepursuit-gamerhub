
import React from "react";
import { Database, Clock, RefreshCcw } from "lucide-react";
import { StatItem } from "./StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { Progress } from "@/components/ui/progress";

interface DatabaseOverviewProps {
  stats: DatabaseStats;
}

export function DatabaseOverview({ stats }: DatabaseOverviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Database Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="text-sm font-medium mb-2">Collection Stats</h4>
          <div className="space-y-2">
            <StatItem 
              icon={<Database className="h-4 w-4 text-blue-500" />}
              label="Total Laptops"
              value={stats.totalLaptops}
            />
            
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
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="text-sm font-medium mb-2">Update Statistics</h4>
          <div className="space-y-2">
            <StatItem 
              icon={<RefreshCcw className="h-4 w-4 text-green-500" />}
              label="Updated Last 24h"
              value={stats.updateStatus.updatedLast24h.count}
            />
            
            <StatItem 
              icon={<RefreshCcw className="h-4 w-4 text-green-500" />}
              label="Updated Last 7d"
              value={stats.updateStatus.updatedLast7d.count}
            />
            
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Update Completion</span>
                <span className="text-sm font-medium">{stats.updateStatus.completed.percentage}%</span>
              </div>
              <Progress 
                value={stats.updateStatus.completed.percentage} 
                className="h-2"
                indicatorClassName={`${
                  stats.updateStatus.completed.percentage >= 75 ? 'bg-green-500' : 
                  stats.updateStatus.completed.percentage >= 50 ? 'bg-blue-500' : 
                  stats.updateStatus.completed.percentage >= 25 ? 'bg-amber-500' : 
                  'bg-red-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

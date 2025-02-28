
import React from "react";
import { CircleCheck, Clock, CircleAlert, RotateCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StatItem } from "./StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface UpdateStatusOverviewProps {
  stats: DatabaseStats;
}

export function UpdateStatusOverview({ stats }: UpdateStatusOverviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Update Status</h3>
      
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
              icon={<RotateCw className="h-4 w-4 text-blue-500" />}
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
            ({stats.updateStatus.completed.percentage}%)
          </span>
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
  );
}

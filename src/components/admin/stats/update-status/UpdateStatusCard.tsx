
import React from "react";
import { Clock, RotateCw, CircleCheck, CircleAlert } from "lucide-react";
import { StatItem } from "../StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface UpdateStatusCardProps {
  stats: DatabaseStats;
}

export function UpdateStatusCard({ stats }: UpdateStatusCardProps) {
  return (
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
  );
}

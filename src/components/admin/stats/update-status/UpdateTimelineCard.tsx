
import React from "react";
import { Clock, CircleCheck } from "lucide-react";
import { StatItem } from "../StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface UpdateTimelineCardProps {
  stats: DatabaseStats;
}

export function UpdateTimelineCard({ stats }: UpdateTimelineCardProps) {
  return (
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
  );
}

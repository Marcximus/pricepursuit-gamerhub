
import React from "react";
import { Database, Clock } from "lucide-react";
import { StatItem } from "./StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface DatabaseOverviewProps {
  stats: DatabaseStats;
}

export function DatabaseOverview({ stats }: DatabaseOverviewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Database Overview</h3>
      
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
  );
}

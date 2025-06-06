
import React from "react";
import { Search, Loader2, AlertCircle, CheckSquare } from "lucide-react";
import { StatItem } from "./StatItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface AiProcessingStatusProps {
  stats: DatabaseStats;
}

export function AiProcessingStatus({ stats }: AiProcessingStatusProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">AI Processing Status</h3>
      
      <div className="space-y-2">
        <StatItem 
          icon={<Search className="h-4 w-4 text-slate-500" />}
          label="Pending"
          value={stats.aiProcessingStatus.pending.count}
        />
        
        <StatItem 
          icon={<Loader2 className="h-4 w-4 text-blue-500" />}
          label="Processing"
          value={stats.aiProcessingStatus.processing.count}
        />
        
        <StatItem 
          icon={<AlertCircle className="h-4 w-4 text-red-500" />}
          label="Error"
          value={stats.aiProcessingStatus.error.count}
        />
        
        <StatItem 
          icon={<CheckSquare className="h-4 w-4 text-green-500" />}
          label="Complete"
          value={stats.aiProcessingStatus.complete.count}
        />
        
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm">Processing Completion</span>
            <span className="text-sm font-medium">{stats.aiProcessingStatus.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                stats.aiProcessingStatus.completionPercentage >= 75 ? 'bg-green-500' : 
                stats.aiProcessingStatus.completionPercentage >= 50 ? 'bg-blue-500' : 
                stats.aiProcessingStatus.completionPercentage >= 25 ? 'bg-amber-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${stats.aiProcessingStatus.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { MissingDataItem } from "./MissingDataItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  const calculateMissingPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Missing Information</h3>
      
      <div className="space-y-3">
        <MissingDataItem 
          label="Missing Any Spec"
          percentage={calculateMissingPercentage(stats.missingInfo.missingAnySpec.count, stats.totalLaptops)}
        />
        
        <MissingDataItem 
          label="Missing Processor"
          percentage={calculateMissingPercentage(stats.missingInfo.noProcessor.count, stats.totalLaptops)}
        />
        
        <MissingDataItem 
          label="Missing RAM"
          percentage={calculateMissingPercentage(stats.missingInfo.noRam.count, stats.totalLaptops)}
        />
        
        <MissingDataItem 
          label="Missing Storage"
          percentage={calculateMissingPercentage(stats.missingInfo.noStorage.count, stats.totalLaptops)}
        />
        
        <MissingDataItem 
          label="Missing Graphics"
          percentage={calculateMissingPercentage(stats.missingInfo.noGraphics.count, stats.totalLaptops)}
        />

        <MissingDataItem 
          label="Missing Prices"
          percentage={stats.missingInformation.prices.percentage}
        />
      </div>
    </div>
  );
}

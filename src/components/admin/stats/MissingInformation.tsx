
import React from "react";
import { MissingDataItem } from "./MissingDataItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Missing Information</h3>
      
      <div className="space-y-3">
        <MissingDataItem 
          label="Missing Prices"
          percentage={stats.missingInformation.prices.percentage}
        />
        
        <MissingDataItem 
          label="Missing Processor"
          percentage={stats.missingInformation.processor.percentage}
        />
        
        <MissingDataItem 
          label="Missing RAM"
          percentage={stats.missingInformation.ram.percentage}
        />
        
        <MissingDataItem 
          label="Missing Storage"
          percentage={stats.missingInformation.storage.percentage}
        />
        
        <MissingDataItem 
          label="Missing Graphics"
          percentage={stats.missingInformation.graphics.percentage}
        />
        
        <MissingDataItem 
          label="Missing Screen Size"
          percentage={stats.missingInformation.screenSize.percentage}
        />
      </div>
    </div>
  );
}


import React from "react";
import { MissingDataItem } from "../MissingDataItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, WrenchIcon } from "lucide-react";

interface MissingDataOverviewProps {
  stats: DatabaseStats;
  onDiagnosticRun: () => void;
  onRunAIProcessing: () => void;
}

export function MissingDataOverview({ 
  stats, 
  onDiagnosticRun, 
  onRunAIProcessing 
}: MissingDataOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MissingDataItem 
          label="Missing Prices"
          percentage={stats.missingInformation.prices.percentage}
          count={stats.missingInformation.prices.count}
          total={stats.totalLaptops}
        />
        
        <MissingDataItem 
          label="Missing Processor"
          percentage={stats.missingInformation.processor.percentage}
          count={stats.missingInformation.processor.count}
          total={stats.totalLaptops}
        />
        
        <MissingDataItem 
          label="Missing RAM"
          percentage={stats.missingInformation.ram.percentage}
          count={stats.missingInformation.ram.count}
          total={stats.totalLaptops}
        />
        
        <MissingDataItem 
          label="Missing Storage"
          percentage={stats.missingInformation.storage.percentage}
          count={stats.missingInformation.storage.count}
          total={stats.totalLaptops}
        />
        
        <MissingDataItem 
          label="Missing Graphics"
          percentage={stats.missingInformation.graphics.percentage}
          count={stats.missingInformation.graphics.count}
          total={stats.totalLaptops}
        />
        
        <MissingDataItem 
          label="Missing Screen Size"
          percentage={stats.missingInformation.screenSize.percentage}
          count={stats.missingInformation.screenSize.count}
          total={stats.totalLaptops}
        />
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-md">
        <h4 className="font-medium mb-2">How to improve data quality</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Run "Process with AI" to improve specification extraction</li>
          <li>Check that the collection process is properly parsing product titles</li>
          <li>Verify the normalizer functions are correctly identifying specifications</li>
          <li>Review the logs for any data processing errors</li>
          <li>Check database update queries for proper field mapping</li>
        </ul>
      </div>
      
      <div className="flex justify-end space-x-3 mt-4">
        <Button variant="outline" onClick={onDiagnosticRun}>
          <WrenchIcon className="mr-2 h-4 w-4" />
          Run Diagnostic
        </Button>
        <Button onClick={onRunAIProcessing}>
          Process with AI
          <ArrowRightCircle className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

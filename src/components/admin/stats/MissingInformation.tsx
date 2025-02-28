
import React from "react";
import { MissingDataItem } from "./MissingDataItem";
import { DatabaseStats } from "@/utils/laptop/stats/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MissingInformationProps {
  stats: DatabaseStats;
}

export function MissingInformation({ stats }: MissingInformationProps) {
  // Log detailed information about the missing data to help debug
  console.log('Missing Information Data:', {
    prices: {
      count: stats.missingInformation.prices.count,
      percentage: stats.missingInformation.prices.percentage,
      totalLaptops: stats.totalLaptops
    },
    processor: {
      count: stats.missingInformation.processor.count,
      percentage: stats.missingInformation.processor.percentage
    },
    ram: {
      count: stats.missingInformation.ram.count,
      percentage: stats.missingInformation.ram.percentage
    },
    storage: {
      count: stats.missingInformation.storage.count,
      percentage: stats.missingInformation.storage.percentage
    },
    graphics: {
      count: stats.missingInformation.graphics.count,
      percentage: stats.missingInformation.graphics.percentage
    },
    screenSize: {
      count: stats.missingInformation.screenSize.count,
      percentage: stats.missingInformation.screenSize.percentage
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Missing Information Analysis</CardTitle>
        <CardDescription>
          This section shows what percentage of laptops are missing key specification data
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

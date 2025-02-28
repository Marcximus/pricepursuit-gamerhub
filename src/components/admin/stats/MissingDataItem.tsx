
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MissingDataItemProps {
  label: string;
  percentage: number;
  count?: number;
  total?: number;
}

export function MissingDataItem({ label, percentage, count, total }: MissingDataItemProps) {
  // Determine the severity of the missing data issue
  const getSeverityColor = (percentage: number) => {
    if (percentage < 25) return "bg-green-500";
    if (percentage < 50) return "bg-yellow-500";
    if (percentage < 75) return "bg-orange-500";
    return "bg-red-500";
  };

  const severityColor = getSeverityColor(percentage);
  const textColor = percentage > 50 ? "text-red-600 font-bold" : "text-amber-600";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{label}</span>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-bold ${textColor}`}>{percentage.toFixed(1)}%</span>
            {percentage > 50 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>High percentage of missing data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <Progress value={percentage} className={`h-2 ${severityColor}`} />
        {count !== undefined && total !== undefined && (
          <div className="mt-2 text-xs flex justify-between items-center">
            <span className="text-muted-foreground">
              {count} of {total} items missing this data
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Missing rate: {(count / total * 100).toFixed(1)}%</p>
                  <p>Present rate: {((total - count) / total * 100).toFixed(1)}%</p>
                </TooltipContent>
              </Tooltip>
              </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

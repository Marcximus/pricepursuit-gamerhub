
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">{label}</span>
          <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
        </div>
        <Progress value={percentage} className={`h-2 ${getSeverityColor(percentage)}`} />
        {count !== undefined && total !== undefined && (
          <div className="mt-2 text-xs text-muted-foreground">
            {count} of {total} items missing this data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

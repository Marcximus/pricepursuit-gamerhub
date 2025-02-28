
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MissingDataItemProps {
  label: string;
  percentage: number;
  count: number;
  total: number;
}

export function MissingDataItem({ label, percentage, count, total }: MissingDataItemProps) {
  // Determine severity color based on percentage
  const getSeverityColor = () => {
    if (percentage <= 25) return "bg-green-500";
    if (percentage <= 50) return "bg-yellow-500";
    if (percentage <= 75) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-4 shadow-sm">
      <div className="flex justify-between mb-2">
        <h3 className="font-medium text-sm">{label}</h3>
        <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
      </div>
      
      <Progress 
        value={100 - percentage} 
        className="h-2 mb-2" 
        indicatorClassName={getSeverityColor()}
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Missing: {count} records</span>
        <span>Complete: {total - count} records</span>
      </div>
    </Card>
  );
}

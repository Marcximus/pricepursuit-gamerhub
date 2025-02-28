
import React from "react";
import { Card } from "@/components/ui/card";

interface MissingDataItemProps {
  label: string;
  percentage: number;
  count: number;
  total: number;
}

export function MissingDataItem({ label, percentage, count, total }: MissingDataItemProps) {
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentage < 10) return "bg-green-500";
    if (percentage < 30) return "bg-blue-500";
    if (percentage < 50) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-bold">{percentage.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getColorClass()}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        
        <div className="text-xs text-gray-500 text-right">
          {count.toLocaleString()} of {total.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}


import React from "react";
import { MinusCircle } from "lucide-react";

interface MissingDataItemProps { 
  label: string; 
  percentage: number;
}

export function MissingDataItem({ label, percentage }: MissingDataItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MinusCircle className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span 
          className={`text-sm font-medium ${
            percentage >= 50 ? 'text-red-600' : 
            percentage >= 20 ? 'text-amber-600' : 
            'text-green-600'
          }`}
        >
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${
            percentage >= 50 ? 'bg-red-500' : 
            percentage >= 20 ? 'bg-amber-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}


import React from "react";

interface StatItemProps { 
  icon: React.ReactNode; 
  label: string; 
  value: number;
}

export function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="font-medium">{value.toLocaleString()}</span>
    </div>
  );
}

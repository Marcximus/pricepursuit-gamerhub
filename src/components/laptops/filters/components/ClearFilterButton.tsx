
import React from "react";
import { X } from "lucide-react";

type ClearFilterButtonProps = {
  label: string;
  onClick: () => void;
};

export function ClearFilterButton({ label, onClick }: ClearFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 font-medium transition-colors"
    >
      <X className="h-3 w-3" />
      Clear {label.toLowerCase()}
    </button>
  );
}

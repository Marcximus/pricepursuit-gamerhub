
import React from "react";

type ClearFilterButtonProps = {
  label: string;
  onClick: () => void;
};

export function ClearFilterButton({ label, onClick }: ClearFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
    >
      Clear {label.toLowerCase()}
    </button>
  );
}


import React, { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  count?: number;
};

export function CheckboxItem({ 
  id, 
  label, 
  checked, 
  onCheckedChange,
  disabled = false,
  count
}: CheckboxItemProps) {
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    if (!disabled) {
      onCheckedChange(checked === true);
    }
  }, [onCheckedChange, disabled]);

  return (
    <div className={`flex items-center space-x-2 py-1.5 px-2 rounded transition-colors ${
      disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-blue-50 cursor-pointer'
    }`}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className={`data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-slate-300 ${
          disabled ? 'opacity-50' : ''
        }`}
      />
      <label
        htmlFor={id}
        className={`text-sm leading-none flex-1 font-medium ${
          disabled ? 'text-slate-400' : 'text-slate-700 cursor-pointer'
        }`}
      >
        {label}
        {count !== undefined && (
          <span className="ml-1.5 text-xs text-slate-500">({count})</span>
        )}
      </label>
    </div>
  );
}

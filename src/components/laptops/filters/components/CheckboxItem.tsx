
import React, { useCallback, memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
};

// Use memo to prevent unnecessary re-renders of checkbox items
export const CheckboxItem = memo(function CheckboxItem({ 
  id, 
  label, 
  checked, 
  onCheckedChange, 
  disabled = false 
}: CheckboxItemProps) {
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    onCheckedChange(checked === true);
  }, [onCheckedChange]);

  const handleItemClick = useCallback(() => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  }, [checked, disabled, onCheckedChange]);

  return (
    <div 
      className={`flex items-center space-x-2 py-1.5 px-2 rounded transition-colors ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-blue-50 cursor-pointer'
      }`}
      onClick={handleItemClick}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-slate-300"
        onClick={(e) => e.stopPropagation()}
      />
      <label
        htmlFor={id}
        className={`text-sm leading-none flex-1 font-medium ${
          disabled ? 'text-slate-400' : 'text-slate-700'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {label}
      </label>
    </div>
  );
});

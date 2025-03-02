
import React, { useCallback, memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

// Memoize the checkbox item to prevent unnecessary re-renders
export const CheckboxItem = memo(function CheckboxItem({ 
  id, 
  label, 
  checked, 
  onCheckedChange 
}: CheckboxItemProps) {
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    onCheckedChange(checked === true);
  }, [onCheckedChange]);

  return (
    <div className="flex items-center space-x-2 py-1.5 px-2 rounded hover:bg-blue-50 transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-slate-300"
      />
      <label
        htmlFor={id}
        className="text-sm leading-none cursor-pointer flex-1 text-slate-700 font-medium"
      >
        {label}
      </label>
    </div>
  );
});

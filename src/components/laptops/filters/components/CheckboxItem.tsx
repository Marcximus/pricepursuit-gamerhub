
import React, { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type CheckboxItemProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function CheckboxItem({ id, label, checked, onCheckedChange }: CheckboxItemProps) {
  const handleCheckedChange = useCallback((checked: boolean | "indeterminate") => {
    onCheckedChange(checked === true);
  }, [onCheckedChange]);

  return (
    <div className="flex items-center space-x-2 py-2 px-3 rounded hover:bg-blue-50 transition-colors cursor-pointer">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="h-5 w-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-slate-300"
      />
      <label
        htmlFor={id}
        className="text-sm leading-none cursor-pointer flex-1 text-slate-700 font-medium py-1.5"
      >
        {label}
      </label>
    </div>
  );
}

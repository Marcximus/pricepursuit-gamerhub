
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
    <div className="flex items-center space-x-2 py-1 px-3 rounded hover:bg-green-50 transition-colors cursor-pointer">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="h-4 w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 border-slate-300"
      />
      <label
        htmlFor={id}
        className="text-sm leading-none cursor-pointer flex-1 text-slate-700 font-medium py-1"
      >
        {label}
      </label>
    </div>
  );
}

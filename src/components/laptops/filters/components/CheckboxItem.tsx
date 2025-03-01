
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
    <div className="flex items-center space-x-2 py-1 px-1 rounded hover:bg-slate-50">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      />
      <label
        htmlFor={id}
        className="text-sm leading-none cursor-pointer flex-1 text-slate-700"
      >
        {label}
      </label>
    </div>
  );
}

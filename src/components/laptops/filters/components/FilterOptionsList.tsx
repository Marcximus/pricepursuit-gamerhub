
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";

export type FilterOption = {
  name: string;
  count: number;
  disabled: boolean;
};

type FilterOptionsListProps = {
  title: string;
  options: FilterOption[];
  selectedOptions: Set<string>;
  onOptionChange: (option: string, checked: boolean) => void;
};

export function FilterOptionsList({ 
  title, 
  options, 
  selectedOptions, 
  onOptionChange 
}: FilterOptionsListProps) {
  return (
    <ScrollArea className={`${options.length > 8 ? 'h-[240px]' : ''} rounded-md`}>
      <div className="space-y-1">
        {options.length > 0 ? (
          options.map((option) => (
            <CheckboxItem
              key={option.name}
              id={`${title}-${option.name}`}
              label={option.name}
              checked={selectedOptions.has(option.name)}
              onCheckedChange={(checked) => onOptionChange(option.name, checked)}
              disabled={option.disabled}
              count={option.count}
            />
          ))
        ) : (
          <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-md">
            No options available
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

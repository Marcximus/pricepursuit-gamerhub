
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";

type FilterOptionsListProps = {
  title: string;
  options: string[];
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
      <div className="space-y-1 px-1">
        {options.length > 0 ? (
          options.map((option) => (
            <CheckboxItem
              key={option}
              id={`${title}-${option}`}
              label={option}
              checked={selectedOptions.has(option)}
              onCheckedChange={(checked) => onOptionChange(option, checked)}
            />
          ))
        ) : (
          <div className="text-sm text-slate-500 py-2 text-center">
            No options available
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

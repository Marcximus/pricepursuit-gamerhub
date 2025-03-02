
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";

type FilterOptionsListProps = {
  title: string;
  options: string[];
  selectedOptions: Set<string>;
  onOptionChange: (option: string, checked: boolean) => void;
  disabledOptions?: Set<string>;
};

export function FilterOptionsList({ 
  title, 
  options, 
  selectedOptions, 
  onOptionChange,
  disabledOptions = new Set()
}: FilterOptionsListProps) {
  return (
    <div className="flex flex-col">
      <ScrollArea className={`${options.length > 8 ? 'h-[240px]' : ''} rounded-md`}>
        <div className="space-y-1">
          {options.length > 0 ? (
            options.map((option) => (
              <CheckboxItem
                key={option}
                id={`${title}-${option}`}
                label={option}
                checked={selectedOptions.has(option)}
                onCheckedChange={(checked) => onOptionChange(option, checked)}
                disabled={disabledOptions.has(option)}
              />
            ))
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-md">
              No options available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

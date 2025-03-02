
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";
import { X } from "lucide-react";

type FilterOptionsListProps = {
  title: string;
  options: string[];
  selectedOptions: Set<string>;
  onOptionChange: (option: string, checked: boolean) => void;
  showClearButtons?: boolean;
};

export function FilterOptionsList({ 
  title, 
  options, 
  selectedOptions, 
  onOptionChange,
  showClearButtons = false
}: FilterOptionsListProps) {
  return (
    <ScrollArea className={`${options.length > 8 ? 'h-[240px]' : ''} rounded-md`}>
      <div className="space-y-1">
        {selectedOptions.size > 0 && showClearButtons && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {Array.from(selectedOptions).map(option => (
              <button
                key={`clear-${option}`}
                onClick={() => onOptionChange(option, false)}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors"
              >
                {option}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
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
          <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-md">
            No options available
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

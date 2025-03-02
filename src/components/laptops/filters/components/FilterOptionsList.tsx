
import React, { memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";

type FilterOptionsListProps = {
  title: string;
  options: string[];
  selectedOptions: Set<string>;
  onOptionChange: (option: string, checked: boolean) => void;
  showClearButtons?: boolean;
};

// Memoize the entire component to prevent unnecessary re-renders
export const FilterOptionsList = memo(function FilterOptionsList({ 
  title, 
  options, 
  selectedOptions, 
  onOptionChange,
  showClearButtons = false
}: FilterOptionsListProps) {
  // Group selected options at top for better UX
  const sortedOptions = React.useMemo(() => {
    if (selectedOptions.size === 0) return options;
    
    // Put selected options first, then unselected ones
    return [
      ...options.filter(option => selectedOptions.has(option)),
      ...options.filter(option => !selectedOptions.has(option))
    ];
  }, [options, selectedOptions]);

  // Determine the max height based on the number of options
  const getScrollAreaHeight = () => {
    if (options.length <= 8) return '';
    if (options.length <= 15) return 'h-[240px]';
    return 'h-[320px]'; // Taller for many options
  };

  return (
    <div className="flex flex-col">
      <ScrollArea className={`${getScrollAreaHeight()} rounded-md`}>
        <div className="space-y-1">
          {options.length > 0 ? (
            sortedOptions.map((option) => (
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
      
      {/* Show count if there are many options */}
      {options.length > 15 && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          Showing {options.length} options
        </div>
      )}
    </div>
  );
});

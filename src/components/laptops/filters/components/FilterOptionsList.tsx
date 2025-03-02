
import React, { memo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";
import { Button } from "@/components/ui/button";

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
  // Add state to track if we're showing all options or a limited set
  const [showAllOptions, setShowAllOptions] = useState(false);
  
  // Limit displayed options initially to improve performance
  const initialDisplayLimit = 100;
  
  // Group selected options at top for better UX
  const sortedOptions = React.useMemo(() => {
    if (selectedOptions.size === 0) return options;
    
    // Put selected options first, then unselected ones
    return [
      ...options.filter(option => selectedOptions.has(option)),
      ...options.filter(option => !selectedOptions.has(option))
    ];
  }, [options, selectedOptions]);

  // Get the options to display based on our limit or showing all
  const displayedOptions = React.useMemo(() => {
    if (showAllOptions || sortedOptions.length <= initialDisplayLimit) {
      return sortedOptions;
    }
    
    // If we have selected options, always show them
    const selectedOpts = sortedOptions.filter(opt => selectedOptions.has(opt));
    
    // If all selected options fit within limit, add more unselected options
    if (selectedOpts.length < initialDisplayLimit) {
      const remainingLimit = initialDisplayLimit - selectedOpts.length;
      const unselectedOptions = sortedOptions.filter(opt => !selectedOptions.has(opt)).slice(0, remainingLimit);
      return [...selectedOpts, ...unselectedOptions];
    }
    
    // If there are too many selected options, just show those and truncate
    return selectedOpts.slice(0, initialDisplayLimit);
  }, [sortedOptions, selectedOptions, showAllOptions, initialDisplayLimit]);

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
            displayedOptions.map((option) => (
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
          
          {!showAllOptions && options.length > initialDisplayLimit && (
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => setShowAllOptions(true)}
            >
              Show all {options.length} options
            </Button>
          )}
        </div>
      </ScrollArea>
      
      {/* Show count if there are many options */}
      {options.length > 15 && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          {showAllOptions 
            ? `Showing all ${options.length} options` 
            : `Showing ${Math.min(displayedOptions.length, initialDisplayLimit)} of ${options.length} options`}
        </div>
      )}
    </div>
  );
});

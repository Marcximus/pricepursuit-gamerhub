
import React, { memo, useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxItem } from "./CheckboxItem";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./SearchInput";

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
  // Add state for search filter
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add state to track if we're showing all options or a limited set
  const [showAllOptions, setShowAllOptions] = useState(false);
  
  // Limit displayed options initially to improve performance
  const initialDisplayLimit = 20; // Lower initial limit for better performance
  
  // Filter options based on search query and selected status
  const filteredAndSortedOptions = useMemo(() => {
    // First, filter by search query
    const lowercaseQuery = searchQuery.toLowerCase();
    
    let filtered = options;
    if (searchQuery) {
      filtered = options.filter(option => 
        option.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    // Then sort to put selected items at the top
    return [
      ...filtered.filter(option => selectedOptions.has(option)),
      ...filtered.filter(option => !selectedOptions.has(option))
    ];
  }, [options, selectedOptions, searchQuery]);

  // Get the options to display based on our limit or showing all
  const displayedOptions = useMemo(() => {
    // If showing all or filtered results are small enough, show all filtered results
    if (showAllOptions || filteredAndSortedOptions.length <= initialDisplayLimit) {
      return filteredAndSortedOptions;
    }
    
    // Always show selected options
    const selectedOpts = filteredAndSortedOptions.filter(opt => selectedOptions.has(opt));
    
    // If all selected options fit within limit, add more unselected options
    if (selectedOpts.length < initialDisplayLimit) {
      const remainingLimit = initialDisplayLimit - selectedOpts.length;
      const unselectedOptions = filteredAndSortedOptions
        .filter(opt => !selectedOptions.has(opt))
        .slice(0, remainingLimit);
      return [...selectedOpts, ...unselectedOptions];
    }
    
    // If there are too many selected options, just show those and truncate
    return selectedOpts.slice(0, initialDisplayLimit);
  }, [filteredAndSortedOptions, selectedOptions, showAllOptions, initialDisplayLimit]);

  // Determine the max height based on the number of options
  const getScrollAreaHeight = () => {
    if (options.length <= 8) return 'h-[200px]';
    if (options.length <= 15) return 'h-[240px]';
    return 'h-[320px]'; // Taller for many options
  };

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Auto-show all when searching
    if (e.target.value) {
      setShowAllOptions(true);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowAllOptions(false);
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Only show search if we have many options */}
      {options.length > 10 && (
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder={`Search ${title.toLowerCase()}...`}
        />
      )}
      
      <ScrollArea className={`${getScrollAreaHeight()} rounded-md`}>
        <div className="space-y-1 p-1">
          {options.length > 0 ? (
            displayedOptions.length > 0 ? (
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
              searchQuery ? (
                <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-md">
                  No matching {title.toLowerCase()} found
                </div>
              ) : (
                <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-md">
                  No options available
                </div>
              )
            )
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-md">
              No options available
            </div>
          )}
          
          {!showAllOptions && filteredAndSortedOptions.length > initialDisplayLimit && !searchQuery && (
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              onClick={() => setShowAllOptions(true)}
            >
              Show all {filteredAndSortedOptions.length} options
            </Button>
          )}
        </div>
      </ScrollArea>
      
      {/* Show count if there are many options */}
      {options.length > 15 && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          {searchQuery ? (
            `Found ${filteredAndSortedOptions.length} matching ${title.toLowerCase()}`
          ) : (
            showAllOptions 
              ? `Showing all ${filteredAndSortedOptions.length} options` 
              : `Showing ${Math.min(displayedOptions.length, initialDisplayLimit)} of ${filteredAndSortedOptions.length} options`
          )}
        </div>
      )}
    </div>
  );
});

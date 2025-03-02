
import { useCallback, useState, useMemo } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "./components/SearchInput";
import { FilterOptionsList } from "./components/FilterOptionsList";
import { FilterIcon } from "./components/FilterIcon";
import { sortProcessorOptions } from "./utils/processorSort";

type FilterSectionProps = {
  title: string;
  options: Set<string>;
  selectedOptions: Set<string>;
  onChange: (options: Set<string>) => void;
  defaultExpanded?: boolean;
  icon?: string;
};

export function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onChange,
  defaultExpanded = false,
  icon = "box"
}: FilterSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const optionsArray = useMemo(() => Array.from(options), [options]);
  const hasSelections = selectedOptions.size > 0;

  // Log for debugging
  console.log(`Rendering ${title} filter section with ${optionsArray.length} options`);
  
  // Memoize filtered options to prevent recalculation on every render
  const filteredOptions = useMemo(() => {
    // Early return if no search query
    if (!searchQuery) return optionsArray;
    
    const lowerQuery = searchQuery.toLowerCase();
    return optionsArray.filter(option => 
      option.toLowerCase().includes(lowerQuery)
    );
  }, [optionsArray, searchQuery]);

  // Memoize sorted options to prevent recalculation on every render
  const sortedOptions = useMemo(() => {
    if (title === "Processor") {
      return sortProcessorOptions(filteredOptions);
    } else if (title === "Brand") {
      // Make sure "Other" is always at the end
      return [...filteredOptions].sort((a, b) => {
        if (a === "Other") return 1; // Move "Other" to the end
        if (b === "Other") return -1; // Move "Other" to the end
        return a.localeCompare(b); // Regular alphabetical sort
      });
    } else if (title === "RAM") {
      // Sort RAM sizes numerically
      return [...filteredOptions].sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || "0", 10);
        const bNum = parseInt(b.match(/\d+/)?.[0] || "0", 10);
        return aNum - bNum;
      });
    } else if (title === "Storage") {
      // Sort storage sizes numerically, with TB after GB
      return [...filteredOptions].sort((a, b) => {
        const aMatch = a.match(/(\d+)\s*(GB|TB)/i);
        const bMatch = b.match(/(\d+)\s*(GB|TB)/i);
        
        if (!aMatch && !bMatch) return a.localeCompare(b);
        if (!aMatch) return 1;
        if (!bMatch) return -1;
        
        const aValue = parseInt(aMatch[1], 10);
        const bValue = parseInt(bMatch[1], 10);
        const aUnit = aMatch[2].toUpperCase();
        const bUnit = bMatch[2].toUpperCase();
        
        // Convert to GB for comparison
        const aGB = aUnit === "TB" ? aValue * 1024 : aValue;
        const bGB = bUnit === "TB" ? bValue * 1024 : bValue;
        
        return aGB - bGB;
      });
    } else if (title === "Screen Size") {
      // Sort screen sizes numerically
      return [...filteredOptions].sort((a, b) => {
        const aNum = parseFloat(a.match(/\d+(\.\d+)?/)?.[0] || "0");
        const bNum = parseFloat(b.match(/\d+(\.\d+)?/)?.[0] || "0");
        return aNum - bNum;
      });
    }
    return filteredOptions;
  }, [filteredOptions, title]);

  const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
    onChange(new Set(checked 
      ? [...selectedOptions, option] 
      : [...selectedOptions].filter(item => item !== option)
    ));
  }, [selectedOptions, onChange]);

  const handleClearFilter = useCallback(() => {
    onChange(new Set());
  }, [onChange]);

  return (
    <AccordionItem value={title} className="border-b border-slate-200">
      <AccordionTrigger 
        className="text-sm font-medium hover:no-underline px-3 py-3.5 rounded-md hover:bg-slate-100 transition-colors group data-[state=open]:bg-blue-50 data-[state=open]:text-blue-700"
      >
        <div className="flex items-center gap-2.5 w-full">
          <div className="flex-shrink-0 text-slate-600 group-data-[state=open]:text-blue-600">
            <FilterIcon iconType={icon} />
          </div>
          <span className="text-slate-800 group-hover:text-slate-900 group-data-[state=open]:text-blue-700">
            {title}
            {optionsArray.length > 0 && (
              <span className="text-xs text-slate-500 ml-1.5">
                ({optionsArray.length})
              </span>
            )}
          </span>
          {hasSelections && (
            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold">
              {selectedOptions.size}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-3 pb-4 px-3">
        {options.size > 8 && (
          <SearchInput
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        )}
        
        <FilterOptionsList
          title={title}
          options={sortedOptions}
          selectedOptions={selectedOptions}
          onOptionChange={handleCheckboxChange}
        />
        
        {hasSelections && (
          <button
            onClick={handleClearFilter}
            className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear {selectedOptions.size} selected {title.toLowerCase()}
          </button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}


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
    if (title === "Processors") {
      return sortProcessorOptions(filteredOptions);
    } else if (title === "Brands") {
      return [...filteredOptions].sort((a, b) => a.localeCompare(b));
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
          <span className="text-slate-800 group-hover:text-slate-900 group-data-[state=open]:text-blue-700">{title}</span>
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
      </AccordionContent>
    </AccordionItem>
  );
}

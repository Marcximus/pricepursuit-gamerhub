
import { useCallback, useState, useMemo } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "./components/SearchInput";
import { ClearFilterButton } from "./components/ClearFilterButton";
import { FilterOptionsList, type FilterOption } from "./components/FilterOptionsList";
import { FilterIcon } from "./components/FilterIcon";
import { sortProcessorOptions } from "./utils/processorSort";

type FilterSectionProps = {
  title: string;
  options: Record<string, number>; // option name -> count mapping
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
  const hasSelections = selectedOptions.size > 0;

  // Convert options record to array
  const optionsArray = useMemo(() => {
    return Object.entries(options).map(([name, count]) => ({
      name,
      count,
      // No options are disabled if nothing is selected
      disabled: hasSelections ? count === 0 : false
    }));
  }, [options, hasSelections]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    return optionsArray.filter(option => 
      option.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [optionsArray, searchQuery]);

  // Sort options based on filter type
  const sortedOptions: FilterOption[] = useMemo(() => {
    if (title === "Processor") {
      return sortProcessorOptions(filteredOptions);
    } else if (title === "Brand") {
      return filteredOptions.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by enabled status first, then by name
      return filteredOptions.sort((a, b) => {
        // Place enabled options before disabled ones
        if (a.disabled !== b.disabled) {
          return a.disabled ? 1 : -1;
        }
        // If both are enabled or both disabled, sort by name
        return a.name.localeCompare(b.name);
      });
    }
  }, [filteredOptions, title]);

  const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
    const newSelected = new Set(selectedOptions);
    if (checked) {
      newSelected.add(option);
    } else {
      newSelected.delete(option);
    }
    onChange(newSelected);
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
        {optionsArray.length > 8 && (
          <SearchInput
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        )}
        
        {hasSelections && (
          <div className="mb-3 flex justify-end">
            <ClearFilterButton 
              label={title}
              onClick={handleClearFilter}
            />
          </div>
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

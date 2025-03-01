
import { useCallback, useState } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "./components/SearchInput";
import { ClearFilterButton } from "./components/ClearFilterButton";
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
  const optionsArray = Array.from(options);
  const hasSelections = selectedOptions.size > 0;

  // Filter options based on search query
  const filteredOptions = optionsArray.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort options based on filter type
  const sortedOptions = title === "Processors" 
    ? sortProcessorOptions(filteredOptions)
    : title === "Brands" 
      ? filteredOptions.sort((a, b) => a.localeCompare(b)) // Sort brands alphabetically
      : filteredOptions;

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
      <AccordionTrigger className="text-sm font-medium hover:no-underline px-2 py-3 rounded-md hover:bg-slate-50 transition-colors group">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-shrink-0">
            <FilterIcon iconType={icon} />
          </div>
          <span className="text-slate-800 group-hover:text-slate-900">{title}</span>
          {hasSelections && (
            <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {selectedOptions.size}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-3 px-1">
        {options.size > 8 && (
          <SearchInput
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        )}
        
        {hasSelections && (
          <div className="mb-2 flex justify-end">
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

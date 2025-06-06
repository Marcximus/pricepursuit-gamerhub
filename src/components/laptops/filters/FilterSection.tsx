
import { useCallback } from "react";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  const optionsArray = Array.from(options);
  const hasSelections = selectedOptions.size > 0;

  // Sort options based on filter type
  const sortedOptions = title === "Processors" 
    ? sortProcessorOptions(optionsArray)
    : title === "Graphics"
      ? sortGraphicsOptions(optionsArray)
      : title === "Brands"
        ? optionsArray.sort((a, b) => a.localeCompare(b)) // Sort brands alphabetically
        : optionsArray;

  const handleCheckboxChange = useCallback((option: string, checked: boolean) => {
    const newSelected = new Set(selectedOptions);
    if (checked) {
      newSelected.add(option);
    } else {
      newSelected.delete(option);
    }
    onChange(newSelected);
  }, [selectedOptions, onChange]);

  return (
    <AccordionItem value={title} className="border-b border-slate-200">
      <AccordionTrigger 
        className="text-sm font-medium hover:no-underline px-3 py-4 rounded-md hover:bg-slate-100 transition-colors group data-[state=open]:bg-green-50 data-[state=open]:text-green-700"
      >
        <div className="flex items-center gap-2.5 w-full">
          <div className="flex-shrink-0 text-slate-600 group-data-[state=open]:text-green-600">
            <FilterIcon iconType={icon} />
          </div>
          <span className="text-slate-800 group-hover:text-slate-900 group-data-[state=open]:text-green-700">{title}</span>
          {hasSelections && (
            <Badge variant="outline" className="ml-auto bg-green-50 text-green-700 border-green-200 text-xs font-semibold">
              {selectedOptions.size}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-3 pb-5 px-3">
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

// Helper function to sort graphics options alphabetically but with numbers in descending order
function sortGraphicsOptions(options: string[]): string[] {
  // Group options by manufacturer prefix
  const grouped: Record<string, string[]> = {};
  
  options.forEach(option => {
    // Extract the manufacturer prefix (NVIDIA, AMD, Intel, etc.)
    const prefixMatch = option.match(/^([A-Za-z]+)/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    
    if (!grouped[prefix]) {
      grouped[prefix] = [];
    }
    
    grouped[prefix].push(option);
  });
  
  // Sort each group's options
  Object.keys(grouped).forEach(prefix => {
    grouped[prefix].sort((a, b) => {
      // Extract numbers from the strings
      const aNumbers = a.match(/\d+/g);
      const bNumbers = b.match(/\d+/g);
      
      // If both have numbers, compare the first number in descending order
      if (aNumbers && bNumbers) {
        const aNum = parseInt(aNumbers[0], 10);
        const bNum = parseInt(bNumbers[0], 10);
        if (aNum !== bNum) {
          return bNum - aNum; // Descending order
        }
      }
      
      // Fall back to alphabetical sorting
      return a.localeCompare(b);
    });
  });
  
  // Sort the groups alphabetically and flatten the result
  return Object.keys(grouped)
    .sort()
    .flatMap(prefix => grouped[prefix]);
}

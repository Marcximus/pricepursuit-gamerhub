
import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Monitor, Search, Box, Laptop, Microchip, Memory, Gpu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

  // Get the appropriate icon component based on the icon prop
  const getIconComponent = () => {
    switch (icon.toLowerCase()) {
      case 'cpu':
        return <Microchip className="h-4 w-4 text-slate-600" />;
      case 'memory':
        return <Memory className="h-4 w-4 text-slate-600" />;
      case 'hard-drive':
        return <HardDrive className="h-4 w-4 text-slate-600" />;
      case 'gpu':
        return <Gpu className="h-4 w-4 text-slate-600" />;
      case 'monitor':
        return <Monitor className="h-4 w-4 text-slate-600" />;
      case 'brand':
        return <Laptop className="h-4 w-4 text-slate-600" />;
      default:
        return <Box className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <AccordionItem value={title} className="border-b border-slate-200">
      <AccordionTrigger className="text-sm font-medium hover:no-underline px-2 py-3 rounded-md hover:bg-slate-50 transition-colors group">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-shrink-0">
            {getIconComponent()}
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
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-slate-50 border-slate-200 focus:bg-white"
            />
          </div>
        )}
        
        {hasSelections && (
          <div className="mb-2 flex justify-end">
            <button 
              onClick={handleClearFilter}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear {title.toLowerCase()}
            </button>
          </div>
        )}
        
        <ScrollArea className={`${filteredOptions.length > 8 ? 'h-[240px]' : ''} rounded-md`}>
          <div className="space-y-1 px-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2 py-1 px-1 rounded hover:bg-slate-50">
                  <Checkbox
                    id={`${title}-${option}`}
                    checked={selectedOptions.has(option)}
                    onCheckedChange={(checked) => {
                      handleCheckboxChange(option, checked === true);
                    }}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label
                    htmlFor={`${title}-${option}`}
                    className="text-sm leading-none cursor-pointer flex-1 text-slate-700"
                  >
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 py-2 text-center">
                {searchQuery ? "No matches found" : "No options available"}
              </div>
            )}
          </div>
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
}

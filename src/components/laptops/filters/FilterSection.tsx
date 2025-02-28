
import { useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

type FilterSectionProps = {
  title: string;
  options: Set<string>;
  selectedOptions: Set<string>;
  onChange: (options: Set<string>) => void;
  defaultExpanded?: boolean;
};

export function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onChange,
  defaultExpanded = false
}: FilterSectionProps) {
  const optionsArray = Array.from(options);
  const hasSelections = selectedOptions.size > 0;

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
    <AccordionItem value={title} className="border-b">
      <AccordionTrigger className="text-sm font-medium hover:no-underline flex justify-between items-center">
        <div className="flex items-center gap-2">
          {title}
          {hasSelections && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {selectedOptions.size}
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {hasSelections && (
          <div className="mb-2 flex justify-end">
            <button 
              onClick={handleClearFilter}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear selections
            </button>
          </div>
        )}
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4 space-y-2">
            {optionsArray.length > 0 ? (
              optionsArray.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${title}-${option}`}
                    checked={selectedOptions.has(option)}
                    onCheckedChange={(checked) => {
                      handleCheckboxChange(option, checked === true);
                    }}
                  />
                  <label
                    htmlFor={`${title}-${option}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </label>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No options available</div>
            )}
          </div>
        </ScrollArea>
      </AccordionContent>
    </AccordionItem>
  );
}

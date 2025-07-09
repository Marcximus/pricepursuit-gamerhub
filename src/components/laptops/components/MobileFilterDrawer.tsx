
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LaptopFilters, FilterOptions } from "../LaptopFilters";
import { useState } from "react";

type MobileFilterDrawerProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeFiltersCount: number;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  filterOptions: {
    processors: Set<string>;
    ramSizes: Set<string>;
    storageOptions: Set<string>;
    graphicsCards: Set<string>;
    screenSizes: Set<string>;
    brands: Set<string>;
  };
};

export function MobileFilterDrawer({
  open,
  setOpen,
  activeFiltersCount,
  filters,
  onFiltersChange,
  filterOptions
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(open);
  
  const handleOpenChange = (openState: boolean) => {
    setIsOpen(openState);
    setOpen(openState);
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="lg:hidden relative border-slate-200 text-slate-700 h-10 px-4 py-2 touch-manipulation min-w-[100px]"
        >
          <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
              {activeFiltersCount > 99 ? '99+' : activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[400px] p-0">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <span className="text-sm text-slate-500">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto scroll-area p-4">
            <LaptopFilters
              filters={filters}
              onFiltersChange={(newFilters) => {
                onFiltersChange(newFilters);
              }}
              processors={filterOptions.processors}
              ramSizes={filterOptions.ramSizes}
              storageOptions={filterOptions.storageOptions}
              graphicsCards={filterOptions.graphicsCards}
              screenSizes={filterOptions.screenSizes}
              brands={filterOptions.brands}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

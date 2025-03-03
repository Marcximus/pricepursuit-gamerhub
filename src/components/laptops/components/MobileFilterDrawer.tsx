
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LaptopFilters, FilterOptions } from "../LaptopFilters";

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
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="lg:hidden relative border-slate-200 text-slate-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-blue-600 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
        <div className="h-full p-6">
          <h2 className="text-lg font-semibold mb-6">Filters</h2>
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
      </SheetContent>
    </Sheet>
  );
}


import { XCircle } from "lucide-react";
import { FilterOptions } from "../LaptopFilters";

type ActiveFilterPillsProps = {
  filters: FilterOptions;
  onRemoveFilter: (filterType: string, value: string) => void;
  onClearSearch: () => void;
  onResetPriceRange?: () => void;
};

export function ActiveFilterPills({ 
  filters, 
  onRemoveFilter, 
  onClearSearch,
  onResetPriceRange
}: ActiveFilterPillsProps) {
  // Check if there is an active search
  const hasActiveSearch = filters?.searchQuery && filters.searchQuery.trim() !== "";
  
  // Check if the price range filter is active
  const isPriceRangeActive = filters?.priceRange && 
    (filters.priceRange.min > 0 || filters.priceRange.max < 10000);
  
  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Get all active filter selections for displaying
  const getActiveFilterSelections = () => {
    if (!filters) return [];
    
    const selections = [];
    
    if (filters.brands.size > 0) {
      Array.from(filters.brands).forEach(brand => 
        selections.push({ type: 'brands', value: brand })
      );
    }
    
    if (filters.processors.size > 0) {
      Array.from(filters.processors).forEach(processor => 
        selections.push({ type: 'processors', value: processor })
      );
    }
    
    if (filters.ramSizes.size > 0) {
      Array.from(filters.ramSizes).forEach(ram => 
        selections.push({ type: 'ramSizes', value: ram })
      );
    }
    
    if (filters.storageOptions.size > 0) {
      Array.from(filters.storageOptions).forEach(storage => 
        selections.push({ type: 'storageOptions', value: storage })
      );
    }
    
    if (filters.graphicsCards.size > 0) {
      Array.from(filters.graphicsCards).forEach(gpu => 
        selections.push({ type: 'graphicsCards', value: gpu })
      );
    }
    
    if (filters.screenSizes.size > 0) {
      Array.from(filters.screenSizes).forEach(screen => 
        selections.push({ type: 'screenSizes', value: screen })
      );
    }
    
    return selections;
  };

  return (
    <div className="flex flex-wrap gap-1 ml-2">
      {/* Show price range filter if active */}
      {isPriceRangeActive && onResetPriceRange && (
        <button
          onClick={onResetPriceRange}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors"
        >
          Price: {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
          <XCircle className="h-3 w-3 ml-0.5" />
        </button>
      )}
      
      {/* Show search query as a filter */}
      {hasActiveSearch && (
        <button
          onClick={onClearSearch}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors"
        >
          Search: {filters.searchQuery}
          <XCircle className="h-3 w-3 ml-0.5" />
        </button>
      )}
      
      {/* Show other active filters */}
      {getActiveFilterSelections().map(({ type, value }, index) => (
        <button
          key={`toolbar-filter-${type}-${value}-${index}`}
          onClick={() => onRemoveFilter(type, value)}
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 transition-colors"
        >
          {value}
          <XCircle className="h-3 w-3 ml-0.5" />
        </button>
      ))}
    </div>
  );
}


import { LaptopSort, type SortOption } from "./LaptopSort";

interface LaptopToolbarProps {
  totalLaptops: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  isLoading: boolean;
  isRefetching: boolean;
}

export function LaptopToolbar({
  totalLaptops,
  sortBy,
  onSortChange,
  isLoading,
  isRefetching,
}: LaptopToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-background">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalLaptops} laptops found
        </span>
        <LaptopSort sortBy={sortBy} onSortChange={onSortChange} />
      </div>
    </div>
  );
}



import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = "price-asc" | "price-desc" | "rating-desc" | "performance-desc";

type LaptopSortProps = {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
};

export function LaptopSort({ sortBy, onSortChange }: LaptopSortProps) {
  return (
    <div className="flex justify-end mb-8">
      <Select
        value={sortBy}
        onValueChange={(value) => onSortChange(value as SortOption)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="rating-desc">Best Rated</SelectItem>
          <SelectItem value="performance-desc">Best Performance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

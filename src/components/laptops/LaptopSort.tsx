
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = "price-asc" | "price-desc" | "rating-desc";

type LaptopSortProps = {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
};

export function LaptopSort({ sortBy, onSortChange }: LaptopSortProps) {
  return (
    <Select
      value={sortBy}
      onValueChange={(value) => onSortChange(value as SortOption)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent
        className="w-[180px] bg-popover shadow-md"
        position="popper"
        sideOffset={4}
        align="end"
        side="bottom"
      >
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="rating-desc">Best Rated</SelectItem>
      </SelectContent>
    </Select>
  );
}

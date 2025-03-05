
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type SortOption = "price-asc" | "price-desc" | "rating-desc";

type LaptopSortProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
};

export function LaptopSort({ value, onChange }: LaptopSortProps) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value as SortOption)}
    >
      <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-sm">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent
        className="w-[180px] bg-white shadow-md"
        position="popper"
        sideOffset={4}
        align="end"
        side="bottom"
      >
        <SelectItem value="price-asc" className="text-sm">Price: Low to High</SelectItem>
        <SelectItem value="price-desc" className="text-sm">Price: High to Low</SelectItem>
        <SelectItem value="rating-desc" className="text-sm">Best Rated</SelectItem>
      </SelectContent>
    </Select>
  );
}

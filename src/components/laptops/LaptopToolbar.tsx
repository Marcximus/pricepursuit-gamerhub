
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { LaptopSort, type SortOption } from "@/components/laptops/LaptopSort";

type LaptopToolbarProps = {
  totalLaptops: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onCollectLaptops: () => void;
  onUpdateLaptops: () => void;
  isLoading: boolean;
  isRefetching: boolean;
};

export function LaptopToolbar({
  totalLaptops,
  sortBy,
  onSortChange,
  isLoading,
  isRefetching
}: LaptopToolbarProps) {
  console.log('LaptopToolbar render:', { 
    isLoading, 
    isRefetching, 
    totalLaptops,
  });

  return (
    <div className="mb-8">
      <div className="flex justify-between items-start gap-4">
        <div className="text-sm text-gray-600 py-2">
          {!isLoading && (
            <>
              <div>Showing {totalLaptops} laptops</div>
              {totalLaptops === 0 && (
                <div className="text-xs text-gray-400 mt-1">
                  (No laptops match current filters)
                </div>
              )}
            </>
          )}
        </div>
        <LaptopSort
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>
    </div>
  );
}

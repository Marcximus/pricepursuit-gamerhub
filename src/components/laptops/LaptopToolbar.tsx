
import { ReloadIcon, UpdateIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { LaptopSort, type SortOption } from "@/components/laptops/LaptopSort";

type LaptopToolbarProps = {
  totalLaptops: number;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  onCollectLaptops: () => void;
  isLoading: boolean;
  isRefetching: boolean;
};

export function LaptopToolbar({
  totalLaptops,
  sortBy,
  onSortChange,
  onCollectLaptops,
  isLoading,
  isRefetching
}: LaptopToolbarProps) {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        {!isLoading && `Found ${totalLaptops} laptops`}
      </div>
      <div className="flex gap-4 items-center">
        <LaptopSort
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
        <Button
          onClick={onCollectLaptops}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2"
        >
          {(isLoading || isRefetching) ? (
            <>
              <ReloadIcon className="h-4 w-4 animate-spin" />
              Collecting...
            </>
          ) : (
            <>
              <UpdateIcon className="h-4 w-4" />
              Collect Laptops
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

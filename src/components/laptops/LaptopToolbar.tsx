
import { ReloadIcon, UpdateIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
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
  onCollectLaptops,
  onUpdateLaptops,
  isLoading,
  isRefetching
}: LaptopToolbarProps) {
  console.log('LaptopToolbar render:', { 
    isLoading, 
    isRefetching, 
    totalLaptops,
  });

  const handleCollectClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isLoading || isRefetching) return;
    onCollectLaptops();
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 space-y-1">
          {!isLoading && (
            <>
              <div>Showing {totalLaptops} laptops</div>
              <div className="text-xs text-gray-400">
                {totalLaptops === 0 ? "(No laptops match current filters)" : ""}
              </div>
            </>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <LaptopSort
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
          <div className="flex gap-2">
            <Button
              onClick={onUpdateLaptops}
              disabled={isLoading || isRefetching}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UpdateIcon className="h-4 w-4" />
              Update Laptops
            </Button>
            <Button
              onClick={handleCollectClick}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-2"
              type="button"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
              Discover Laptops
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

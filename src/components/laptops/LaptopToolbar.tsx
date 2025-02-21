
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
  const handleCollectClick = () => {
    console.log('Collect button clicked');
    console.log('Button states:', { isLoading, isRefetching });
    if (isLoading || isRefetching) {
      console.log('Button is disabled due to loading states');
      return;
    }
    onCollectLaptops();
  };

  console.log('LaptopToolbar render:', { isLoading, isRefetching, totalLaptops });

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
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            Discover Laptops
          </Button>
        </div>
      </div>
    </div>
  );
}

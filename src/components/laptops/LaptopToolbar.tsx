
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { LaptopSort, type SortOption } from "./LaptopSort";
import { removeAccessories } from "@/hooks/useLaptops";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const handleRemoveAccessories = async () => {
    try {
      const result = await removeAccessories();
      toast({
        title: "Accessories Removed",
        description: `Successfully removed ${result.removedCount} accessories from the database.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove accessories. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {totalLaptops} laptop{totalLaptops === 1 ? '' : 's'} found
        </span>
        <LaptopSort value={sortBy} onValueChange={onSortChange} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRemoveAccessories}
        >
          Remove Accessories
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onUpdateLaptops}
          disabled={isLoading || isRefetching}
        >
          {isRefetching ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Prices"
          )}
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onCollectLaptops}
          disabled={isLoading || isRefetching}
        >
          {isLoading ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Collecting...
            </>
          ) : (
            "Collect New"
          )}
        </Button>
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { LaptopSort, type SortOption } from "./LaptopSort";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { processLaptopsAI } from "@/utils/laptop/processLaptopsAI";

interface LaptopToolbarProps {
  totalLaptops: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onCollectLaptops: () => Promise<void>;
  onUpdateLaptops: () => Promise<void>;
  isLoading: boolean;
  isRefetching: boolean;
}

export function LaptopToolbar({
  totalLaptops,
  sortBy,
  onSortChange,
  onCollectLaptops,
  onUpdateLaptops,
  isLoading,
  isRefetching,
}: LaptopToolbarProps) {
  const { toast } = useToast();

  const handleAIProcess = async () => {
    try {
      const result = await processLaptopsAI();
      if (result.success) {
        toast({
          title: "AI Processing Started",
          description: `Processing initiated for ${result.processed} laptops`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start AI processing",
        });
      }
    } catch (error) {
      console.error('Error processing laptops with AI:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process laptops with AI",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-background">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {totalLaptops} laptops found
        </span>
        <LaptopSort value={sortBy} onValueChange={onSortChange} />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onCollectLaptops}
          disabled={isLoading || isRefetching}
        >
          {(isLoading || isRefetching) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Collect New
        </Button>
        
        <Button
          variant="outline"
          onClick={onUpdateLaptops}
          disabled={isLoading || isRefetching}
        >
          {(isLoading || isRefetching) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Update Prices
        </Button>

        <Button
          variant="outline"
          onClick={handleAIProcess}
          disabled={isLoading || isRefetching}
        >
          {(isLoading || isRefetching) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Process with AI
        </Button>
      </div>
    </div>
  );
}

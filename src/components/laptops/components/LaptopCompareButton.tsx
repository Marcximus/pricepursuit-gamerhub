
import { Check, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import type { Product } from "@/types/product";

interface LaptopCompareButtonProps {
  laptop: Product;
}

export function LaptopCompareButton({ laptop }: LaptopCompareButtonProps) {
  const { addToComparison, removeFromComparison, isSelected } = useComparison();
  const selected = isSelected(laptop.id);
  
  const handleToggle = () => {
    if (selected) {
      removeFromComparison(laptop.id);
    } else {
      addToComparison(laptop);
    }
  };
  
  return (
    <Button 
      variant={selected ? "default" : "outline"}
      size="sm"
      className={`flex items-center gap-1 ${selected ? 'bg-primary text-primary-foreground' : 'border border-muted-foreground/30 hover:bg-accent'}`}
      onClick={handleToggle}
      title={selected ? "Remove from comparison" : "Add to comparison"}
    >
      {selected ? (
        <>
          <Check className="w-4 h-4" />
          <span>Selected</span>
        </>
      ) : (
        <>
          <GitCompare className="w-4 h-4" />
          <span>Compare</span>
        </>
      )}
    </Button>
  );
}

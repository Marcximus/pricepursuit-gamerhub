
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
      variant={selected ? "default" : "ghost"}
      size="sm"
      className={`absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full ${selected ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
      onClick={handleToggle}
      title={selected ? "Remove from comparison" : "Add to comparison"}
    >
      {selected ? (
        <Check className="w-4 h-4" />
      ) : (
        <GitCompare className="w-4 h-4" />
      )}
    </Button>
  );
}

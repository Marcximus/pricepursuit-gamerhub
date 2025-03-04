
import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/contexts/ComparisonContext";
import { toast } from "@/components/ui/use-toast";

export default function CompareFloatingButton() {
  const { selectedLaptops, clearComparison, canCompare } = useComparison();
  const navigate = useNavigate();
  
  const handleCompare = () => {
    if (canCompare) {
      navigate('/compare');
    } else {
      toast({
        title: "Select two laptops",
        description: "Please select two laptops to compare",
        variant: "destructive"
      });
    }
  };
  
  if (selectedLaptops.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-background p-3 shadow-lg rounded-lg border">
      <div className="text-sm font-medium">
        {selectedLaptops.length} of 2 selected
      </div>
      
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleCompare}
        disabled={!canCompare}
        className="flex items-center gap-1"
      >
        Compare <ArrowRight className="w-4 h-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={clearComparison}
        className="w-6 h-6"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

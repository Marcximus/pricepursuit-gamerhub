
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ComparisonHeaderProps {
  handleGoBack: () => void;
  handleClearAndGoBack: () => void;
}

const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({ 
  handleGoBack, 
  handleClearAndGoBack 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center ${isMobile ? 'flex-col gap-2' : 'justify-between'} mb-6`}>
      <Button 
        variant="outline" 
        className="flex items-center gap-1 w-full sm:w-auto" 
        onClick={handleGoBack}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Laptops
      </Button>
      
      <Button 
        variant="ghost" 
        onClick={handleClearAndGoBack}
        className="w-full sm:w-auto"
      >
        Clear Comparison
      </Button>
    </div>
  );
};

export default ComparisonHeader;

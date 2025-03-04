
import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface ComparisonHeaderProps {
  handleGoBack: () => void;
  handleClearAndGoBack: () => void;
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({ 
  handleGoBack, 
  handleClearAndGoBack,
  laptopLeft,
  laptopRight
}) => {
  const getHeaderText = () => {
    if (!laptopLeft || !laptopRight) return "Laptop Comparison";
    
    return `Comparing ${laptopLeft.brand} ${laptopLeft.model?.substring(0, 15) || ''} vs ${laptopRight.brand} ${laptopRight.model?.substring(0, 15) || ''}`;
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleGoBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleClearAndGoBack}
          className="flex items-center gap-1"
        >
          <X className="w-4 h-4" /> Clear and Back
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold text-center">{getHeaderText()}</h1>
    </div>
  );
};

export default ComparisonHeader;

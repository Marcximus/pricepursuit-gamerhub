
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ComparisonHeaderProps {
  handleGoBack: () => void;
  handleClearAndGoBack: () => void;
}

const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({ 
  handleGoBack, 
  handleClearAndGoBack 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="outline" 
        className="flex items-center gap-1" 
        onClick={handleGoBack}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Laptops
      </Button>
      
      <Button 
        variant="ghost" 
        onClick={handleClearAndGoBack}
      >
        Clear Comparison
      </Button>
    </div>
  );
};

export default ComparisonHeader;


import React from "react";
import { Card } from "@/components/ui/card";
import type { Product } from "@/types/product";
import type { ComparisonResult } from "../types";
import { ClipboardList } from "lucide-react";
import { formatLaptopDisplayTitle } from "../utils/titleFormatter";
import { SpecificationsTable, useSpecifications } from "./specification";

interface SpecificationsSectionProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
  comparisonResult: ComparisonResult;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ 
  laptopLeft, 
  laptopRight,
  comparisonResult 
}) => {
  if (!laptopLeft || !laptopRight || !comparisonResult) return null;
  
  // Use the hook to get specification rows
  const specRows = useSpecifications(laptopLeft, laptopRight, comparisonResult);
  
  // Format laptop titles for display
  const leftLaptopTitle = formatLaptopDisplayTitle(laptopLeft);
  const rightLaptopTitle = formatLaptopDisplayTitle(laptopRight);
  
  return (
    <Card>
      <div className="bg-muted p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Detailed Specifications
        </h2>
      </div>
      
      <SpecificationsTable 
        specRows={specRows} 
        leftLaptopTitle={leftLaptopTitle} 
        rightLaptopTitle={rightLaptopTitle} 
      />
    </Card>
  );
};

export default SpecificationsSection;

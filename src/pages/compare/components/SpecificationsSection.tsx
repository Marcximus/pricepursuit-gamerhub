
import React from "react";
import { Card } from "@/components/ui/card";
import SpecificationItem from "./SpecificationItem";
import ComparisonSections from "./ComparisonSections";
import type { Product } from "@/types/product";

interface SpecificationsSectionProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ laptopLeft, laptopRight }) => {
  const comparisonSections = ComparisonSections({ laptopLeft, laptopRight });
  
  return (
    <Card>
      <div className="bg-muted p-4">
        <h2 className="text-lg font-semibold">Detailed Specifications</h2>
      </div>
      
      <div className="divide-y">
        {comparisonSections.map((section, index) => (
          <SpecificationItem key={index} section={section} />
        ))}
      </div>
    </Card>
  );
};

export default SpecificationsSection;


import React from "react";
import { Card } from "@/components/ui/card";
import SpecificationItem from "./SpecificationItem";
import type { ComparisonSection } from "../types";

interface SpecificationsSectionProps {
  comparisonSections: ComparisonSection[];
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ comparisonSections }) => {
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

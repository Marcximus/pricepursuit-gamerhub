
import React from "react";
import { Card } from "@/components/ui/card";
import SpecificationItem from "./SpecificationItem";
import ComparisonSections from "./ComparisonSections";
import type { Product } from "@/types/product";
import type { ComparisonSection } from "../types";
import { ClipboardList } from "lucide-react";
import { formatLaptopDisplayTitle } from "../utils/titleFormatter";

interface SpecificationsSectionProps {
  laptopLeft: Product | null;
  laptopRight: Product | null;
}

const SpecificationsSection: React.FC<SpecificationsSectionProps> = ({ laptopLeft, laptopRight }) => {
  const comparisonSections = ComparisonSections({ laptopLeft, laptopRight });
  
  return (
    <Card>
      <div className="bg-muted p-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Detailed Specifications
        </h2>
      </div>
      
      <div className="divide-y">
        <div className="grid grid-cols-7 p-4 bg-slate-50 font-medium">
          <div className="col-span-3 text-left">Specification</div>
          <div className="col-span-2 text-left text-sky-700">
            {formatLaptopDisplayTitle(laptopLeft)}
          </div>
          <div className="col-span-2 text-left text-amber-700">
            {formatLaptopDisplayTitle(laptopRight)}
          </div>
        </div>
        {comparisonSections.map((section, index) => (
          <SpecificationItem 
            key={index} 
            section={section} 
            laptopLeftId={laptopLeft?.asin} 
            laptopRightId={laptopRight?.asin}
          />
        ))}
      </div>
    </Card>
  );
};

export default SpecificationsSection;

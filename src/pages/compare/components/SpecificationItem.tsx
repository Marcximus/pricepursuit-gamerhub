
import React from "react";
import { ChevronsUp, ChevronsDown } from "lucide-react";
import type { ComparisonSection } from "../types";

interface SpecificationItemProps {
  section: ComparisonSection;
}

const SpecificationItem: React.FC<SpecificationItemProps> = ({ section }) => {
  // Determine better/worse indicators if compare function exists
  let leftStatus = 'equal';
  let rightStatus = 'equal';
  
  if (section.compare) {
    const result = section.compare(section.leftValue, section.rightValue);
    leftStatus = result;
    rightStatus = result === 'better' ? 'worse' : result === 'worse' ? 'better' : result;
  }
  
  return (
    <div className="grid grid-cols-7 px-4 py-3">
      <div className="col-span-2 text-center">
        <div className="flex items-center justify-center gap-1">
          {leftStatus === 'better' && <ChevronsUp className="w-4 h-4 text-green-600" />}
          {leftStatus === 'worse' && <ChevronsDown className="w-4 h-4 text-red-600" />}
          <span>{section.leftValue}</span>
        </div>
      </div>
      
      <div className="col-span-3 flex items-center justify-center">
        <span className="text-muted-foreground font-medium">{section.title}</span>
      </div>
      
      <div className="col-span-2 text-center">
        <div className="flex items-center justify-center gap-1">
          {rightStatus === 'better' && <ChevronsUp className="w-4 h-4 text-green-600" />}
          {rightStatus === 'worse' && <ChevronsDown className="w-4 h-4 text-red-600" />}
          <span>{section.rightValue}</span>
        </div>
      </div>
    </div>
  );
};

export default SpecificationItem;

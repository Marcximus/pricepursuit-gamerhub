
import React from "react";
import { SpecificationTitle, SpecificationValue } from "./specification";
import { getAffiliateUrl } from "../utils/affiliateLink";
import { getComparisonStatus } from "../utils/comparisonHelpers";
import type { ComparisonSection } from "../types";

interface SpecificationItemProps {
  section: ComparisonSection;
  laptopLeftId?: string;
  laptopRightId?: string;
}

const SpecificationItem: React.FC<SpecificationItemProps> = ({ 
  section, 
  laptopLeftId, 
  laptopRightId 
}) => {
  // Determine better/worse indicators using the utility function
  const { leftStatus, rightStatus } = getComparisonStatus(
    section.leftValue, 
    section.rightValue, 
    section.compare
  );
  
  // Create affiliate URLs for both laptops
  const leftAffiliateUrl = getAffiliateUrl(laptopLeftId);
  const rightAffiliateUrl = getAffiliateUrl(laptopRightId);
  
  return (
    <div className="grid grid-cols-7 px-4 py-3 hover:bg-slate-50 transition-colors">
      {/* Specification title */}
      <SpecificationTitle title={section.title} />
      
      {/* Left laptop value */}
      <SpecificationValue 
        value={section.leftValue} 
        status={leftStatus} 
        affiliateUrl={leftAffiliateUrl}
        theme="left"
      />
      
      {/* Right laptop value */}
      <SpecificationValue 
        value={section.rightValue} 
        status={rightStatus} 
        affiliateUrl={rightAffiliateUrl}
        theme="right"
      />
    </div>
  );
};

export default SpecificationItem;

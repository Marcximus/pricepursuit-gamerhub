
import React from "react";
import { SpecificationTitle, SpecificationValue } from "./specification";
import { getAffiliateUrl } from "../utils/affiliateLink";
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
  // Determine better/worse indicators if compare function exists
  let leftStatus = 'equal';
  let rightStatus = 'equal';
  
  if (section.compare) {
    const result = section.compare(section.leftValue, section.rightValue);
    leftStatus = result;
    rightStatus = result === 'better' ? 'worse' : result === 'worse' ? 'better' : result;
  }
  
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
        status={leftStatus as 'better' | 'worse' | 'equal' | 'unknown'} 
        affiliateUrl={leftAffiliateUrl}
        theme="left"
      />
      
      {/* Right laptop value */}
      <SpecificationValue 
        value={section.rightValue} 
        status={rightStatus as 'better' | 'worse' | 'equal' | 'unknown'} 
        affiliateUrl={rightAffiliateUrl}
        theme="right"
      />
    </div>
  );
};

export default SpecificationItem;


import React from "react";
import { SpecificationTitle, SpecificationValue } from "./specification";
import { getAffiliateUrl } from "../utils/affiliateLink";
import { getComparisonStatus } from "../utils/comparisonHelpers";
import type { ComparisonSection } from "../types";

// Helper to remove redundant processor prefixes
const cleanProcessorDisplay = (value: string): string => {
  if (typeof value !== 'string') return value;
  
  // Fix for the Intel Core repetition issue
  const cleanedValue = value
    .replace(/(Intel\s+Core\s+)+/gi, 'Intel Core ')
    .replace(/(AMD\s+Ryzen\s+)+/gi, 'AMD Ryzen ')
    .replace(/(Apple\s+M[123]\s+)+/gi, 'Apple M$1 ');
    
  return cleanedValue;
};

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
  
  // Clean up processor display if this is a processor section
  const leftValue = section.title === "Processor" ? cleanProcessorDisplay(section.leftValue) : section.leftValue;
  const rightValue = section.title === "Processor" ? cleanProcessorDisplay(section.rightValue) : section.rightValue;
  
  return (
    <div className="grid grid-cols-7 px-4 py-3 hover:bg-slate-50 transition-colors">
      {/* Specification title */}
      <SpecificationTitle title={section.title} />
      
      {/* Left laptop value */}
      <SpecificationValue 
        value={leftValue} 
        status={leftStatus} 
        affiliateUrl={leftAffiliateUrl}
        theme="left"
      />
      
      {/* Right laptop value */}
      <SpecificationValue 
        value={rightValue} 
        status={rightStatus} 
        affiliateUrl={rightAffiliateUrl}
        theme="right"
      />
    </div>
  );
};

export default SpecificationItem;


import React, { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionProps {
  title: string;
  leftValue: string;
  rightValue: string;
  compare?: (a: string, b: string) => 'better' | 'worse' | 'equal' | 'unknown';
  specInfo?: {
    icon?: string;
    explanation?: string;
  };
}

interface SpecificationItemProps {
  section: SectionProps;
  laptopLeftId?: string;
  laptopRightId?: string;
}

const SpecificationItem: React.FC<SpecificationItemProps> = ({ 
  section, 
  laptopLeftId, 
  laptopRightId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine which value is better if there's a comparison function
  const compareValues = () => {
    if (!section.compare) return { left: 'unknown', right: 'unknown' };
    
    const leftComparison = section.compare(section.leftValue, section.rightValue);
    
    // Return the appropriate comparison for each side
    return {
      left: leftComparison,
      right: leftComparison === 'better' ? 'worse' : leftComparison === 'worse' ? 'better' : leftComparison
    };
  };
  
  const comparison = compareValues();
  
  // Function to determine the CSS class for the value based on comparison
  const getValueClass = (side: 'left' | 'right') => {
    if (comparison[side] === 'better') return 'text-green-600 font-medium';
    if (comparison[side] === 'worse') return 'text-red-500';
    return '';
  };
  
  return (
    <div className="grid grid-cols-7 p-4 hover:bg-gray-50 transition-colors">
      <div className="col-span-3 flex items-center">
        <div className="flex items-center gap-2">
          {section.title}
          
          {section.specInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{section.specInfo.explanation}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      <div className={`col-span-2 ${getValueClass('left')}`}>
        {section.leftValue || 'Not available'}
      </div>
      
      <div className={`col-span-2 ${getValueClass('right')}`}>
        {section.rightValue || 'Not available'}
      </div>
    </div>
  );
};

export default SpecificationItem;

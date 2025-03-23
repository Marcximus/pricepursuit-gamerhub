
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpecInfo } from "../../utils/specInfo";

interface SpecificationTitleProps {
  title: string;
}

const SpecificationTitle: React.FC<SpecificationTitleProps> = ({ title }) => {
  const specInfo = getSpecInfo(title);
  
  return (
    <div className="col-span-3 text-left flex items-center gap-2">
      {specInfo.emoji && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-lg">{specInfo.emoji}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{specInfo.description || title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <span className="font-medium">{title}</span>
    </div>
  );
};

export default SpecificationTitle;

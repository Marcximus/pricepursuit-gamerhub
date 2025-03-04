
import React from "react";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getSpecInfo } from "../../utils/specInfo";

interface SpecificationTitleProps {
  title: string;
}

const SpecificationTitle: React.FC<SpecificationTitleProps> = ({ title }) => {
  const { emoji, tooltip } = getSpecInfo(title);
  
  return (
    <div className="col-span-3 flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1.5 cursor-help text-left">
              {emoji && <span className="text-lg">{emoji}</span>}
              <span className="text-muted-foreground font-medium">{title}</span>
              {tooltip && <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/70" />}
            </span>
          </TooltipTrigger>
          {tooltip && <TooltipContent className="max-w-xs text-sm">{tooltip}</TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SpecificationTitle;


import React from "react";
import { ChevronsUp, ChevronsDown, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  
  // Get emoji and tooltip based on specification type
  const getSpecInfo = (title: string) => {
    switch (title.toLowerCase()) {
      case "rating count":
        return {
          emoji: "👥",
          tooltip: "The number of user ratings this laptop has received. Higher numbers indicate more user feedback."
        };
      case "total reviews":
        return {
          emoji: "📝",
          tooltip: "The total number of written reviews. More reviews can give you better insights about real-world usage."
        };
      case "benchmark score":
        return {
          emoji: "🚀",
          tooltip: "Overall performance score. Higher values indicate better overall system performance."
        };
      case "processor score":
        return {
          emoji: "⚡",
          tooltip: "CPU performance score. Higher values indicate faster processing capabilities."
        };
      case "wilson score":
        return {
          emoji: "⭐",
          tooltip: "Statistical confidence rating that considers both rating value and number of ratings. A more reliable measure than simple rating average."
        };
      case "rating":
        return {
          emoji: "★",
          tooltip: "Average user rating out of 5 stars."
        };
      case "price":
        return {
          emoji: "💰",
          tooltip: "Current price of the laptop."
        };
      case "processor":
        return {
          emoji: "🧠",
          tooltip: "The central processing unit (CPU) that powers the laptop."
        };
      case "ram":
        return {
          emoji: "🧮",
          tooltip: "Random Access Memory - affects multitasking capability. More is generally better."
        };
      case "storage":
        return {
          emoji: "💾",
          tooltip: "Amount of space available for storing files and applications."
        };
      case "graphics":
        return {
          emoji: "🎮",
          tooltip: "Graphics processing capability, important for gaming and graphics-intensive tasks."
        };
      case "screen size":
        return {
          emoji: "📏",
          tooltip: "Diagonal measurement of the display screen in inches."
        };
      case "screen resolution":
        return {
          emoji: "🔍",
          tooltip: "Number of pixels displayed on screen. Higher resolution means sharper, more detailed images."
        };
      case "weight":
        return {
          emoji: "⚖️",
          tooltip: "Physical weight of the laptop. Lower weight means better portability."
        };
      case "battery life":
        return {
          emoji: "🔋",
          tooltip: "How long the laptop can run on battery power. Longer is better for portable use."
        };
      default:
        return { emoji: "", tooltip: "" };
    }
  };
  
  const { emoji, tooltip } = getSpecInfo(section.title);
  
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1.5 cursor-help">
                {emoji && <span className="text-lg">{emoji}</span>}
                <span className="text-muted-foreground font-medium">{section.title}</span>
                {tooltip && <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/70" />}
              </span>
            </TooltipTrigger>
            {tooltip && <TooltipContent className="max-w-xs text-sm">{tooltip}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
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

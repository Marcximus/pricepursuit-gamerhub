
import { processScreenSize } from "@/utils/laptopUtils/physicalSpecsProcessor";
import { processScreenResolution } from "@/utils/laptopUtils/processors/screenProcessor";

type ScreenSpecProps = {
  title: string;
  screenSize?: string;
  screenResolution?: string;
};

export function ScreenSpec({ title, screenSize, screenResolution }: ScreenSpecProps) {
  const extractedScreenSize = !screenSize ? processScreenSize(undefined, title) : null;
  const extractedScreenResolution = !screenResolution ? processScreenResolution(undefined, title) : null;
  
  // For display, prioritize database values but fall back to extracted values
  const displayScreenSize = screenSize || extractedScreenSize || 'Not Specified';
  const displayScreenResolution = screenResolution || extractedScreenResolution || '';
  
  return (
    <li>
      <span className="font-bold">Screen:</span>{" "}
      {displayScreenSize 
        ? `${displayScreenSize} ${displayScreenResolution ? `(${displayScreenResolution})` : ''}`
        : 'Not Specified'}
    </li>
  );
}

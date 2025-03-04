
import { processRam } from "@/utils/laptopUtils/processors/ramProcessor";
import { extractMacBookRam } from "./ProcessorUtils";

type RamSpecProps = {
  title: string;
  ram?: string;
};

export function RamSpec({ title, ram }: RamSpecProps) {
  const extractedRam = !ram ? processRam(undefined, title) : null;
  
  // Enhanced RAM extraction for Apple MacBooks
  let displayRam = ram || extractedRam || 'Not Specified';
  
  // If RAM is "Unified" or missing, try to extract from title for MacBooks
  if ((displayRam === 'Not Specified' || displayRam === 'Unified') && title) {
    const macBookRam = extractMacBookRam(title);
    if (macBookRam) {
      displayRam = macBookRam;
    }
  }
  
  return (
    <li>
      <span className="font-bold">RAM:</span>{" "}
      {displayRam}
    </li>
  );
}

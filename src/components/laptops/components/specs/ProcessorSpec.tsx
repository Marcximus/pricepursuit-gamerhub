
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";
import { extractAppleProcessor } from "./ProcessorUtils";

type ProcessorSpecProps = {
  title: string;
  processor?: string;
};

export function ProcessorSpec({ title, processor }: ProcessorSpecProps) {
  // Extract specs from title if they're not specified in the data
  const extractedProcessor = !processor ? extractProcessorFromTitle(title) : null;
  
  // Apple-specific processor handling for MacBooks
  let displayProcessor = processor || extractedProcessor || 'Not Specified';
  
  // Improved MacBook processor detection
  if ((displayProcessor === 'Not Specified' || displayProcessor === 'Apple') && title) {
    const appleProcessor = extractAppleProcessor(title);
    if (appleProcessor) {
      displayProcessor = appleProcessor;
    }
  }
  
  return (
    <li>
      <span className="font-bold">Processor:</span>{" "}
      {displayProcessor}
    </li>
  );
}

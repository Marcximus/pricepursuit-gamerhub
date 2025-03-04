
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";
import { extractAppleProcessor } from "./ProcessorUtils";
import { normalizeProcessor } from "@/utils/laptop/normalizers/processorNormalizer";
import { processProcessor } from "@/utils/laptopUtils/processors/processorProcessor";

type ProcessorSpecProps = {
  title: string;
  processor?: string;
};

export function ProcessorSpec({ title, processor }: ProcessorSpecProps) {
  // Use enhanced processor processor when we have generic "AMD" or "Intel"
  let displayProcessor = processor;
  
  if (!processor || processor === 'AMD' || processor === 'Intel') {
    // Try using the enhanced processor extractor for better results
    const enhancedProcessor = processProcessor(processor, title);
    if (enhancedProcessor && enhancedProcessor !== 'AMD' && enhancedProcessor !== 'Intel') {
      displayProcessor = enhancedProcessor;
    } else {
      // Fall back to the existing extractor
      displayProcessor = extractProcessorFromTitle(title) || processor || 'Not Specified';
    }
  }
  
  // Apple-specific processor handling for MacBooks
  if ((displayProcessor === 'Not Specified' || displayProcessor === 'Apple') && title) {
    const appleProcessor = extractAppleProcessor(title);
    if (appleProcessor) {
      displayProcessor = appleProcessor;
    }
  }

  // Normalize processor name for better display
  if (displayProcessor) {
    displayProcessor = normalizeProcessor(displayProcessor);
  }
  
  return (
    <li>
      <span className="font-bold">Processor:</span>{" "}
      {displayProcessor || 'Not Specified'}
    </li>
  );
}

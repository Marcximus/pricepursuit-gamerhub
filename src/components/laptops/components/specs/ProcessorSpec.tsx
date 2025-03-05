
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
  
  // Check for direct i7-1355U format in title 
  const intelModelMatch = title.match(/i[3579]-\d{4}[A-Z]?/i);
  if (intelModelMatch) {
    displayProcessor = `Intel Core ${intelModelMatch[0]}`;
  }
  // Check for Intel generation format in title (e.g., "Intel 12th Gen i7")
  else if (title.match(/Intel\s+(\d+)(?:th|nd|rd)\s+Gen\s+i([3579])/i)) {
    const intelGenMatch = title.match(/Intel\s+(\d+)(?:th|nd|rd)\s+Gen\s+i([3579])/i);
    if (intelGenMatch) {
      displayProcessor = `Intel Core i${intelGenMatch[2]} ${intelGenMatch[1]}th Gen`;
    }
  }
  // Check for Intel Ultra in title with an improved comprehensive pattern
  else if (title.match(/Intel\s+(?:Core\s+)?Ultra\s+([579])(?:-|_|\s+)(\d{3}[a-z]*)/i)) {
    const ultraMatch = title.match(/Intel\s+(?:Core\s+)?Ultra\s+([579])(?:-|_|\s+)(\d{3}[a-z]*)/i);
    if (ultraMatch) {
      displayProcessor = `Intel Core Ultra ${ultraMatch[1]}-${ultraMatch[2]}`;
    }
  } 
  // If processor is generic or missing, try to extract from title
  else if (!processor || processor === 'AMD' || processor === 'Intel') {
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

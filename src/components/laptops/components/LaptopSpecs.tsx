
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";
import { normalizeModel } from "@/utils/laptop/valueNormalizer";
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";
import { processRam } from "@/utils/laptopUtils/processors/ramProcessor";
import { processGraphics } from "@/utils/laptopUtils/graphicsProcessor";
import { processStorage } from "@/utils/laptopUtils/processors/storageProcessor";
import { processScreenSize } from "@/utils/laptopUtils/physicalSpecsProcessor";
import { processScreenResolution } from "@/utils/laptopUtils/processors/screenProcessor";

type LaptopSpecsProps = {
  title: string;
  productUrl: string;
  specs: {
    screenSize?: string;
    screenResolution?: string;
    processor?: string;
    graphics?: string;
    ram?: string;
    storage?: string;
    weight?: string;
  };
  brand?: string;
  model?: string;
};

export function LaptopSpecs({ title, productUrl, specs, brand, model }: LaptopSpecsProps) {
  // Determine the correct brand using the normalizer
  const correctedBrand = normalizeBrand(brand || '', title);
  
  // Extract model name if not provided using the normalizer
  const displayModel = model || normalizeModel(null, title, correctedBrand);
  
  // Extract specs from title if they're not specified in the data
  // This ensures we use any information available in the title when database values are missing
  const extractedProcessor = !specs.processor ? extractProcessorFromTitle(title) : null;
  const extractedRam = !specs.ram ? processRam(undefined, title) : null;
  const extractedGraphics = !specs.graphics ? processGraphics(undefined, title) : null;
  const extractedStorage = !specs.storage ? processStorage(undefined, title) : null;
  const extractedScreenSize = !specs.screenSize ? processScreenSize(undefined, title) : null;
  const extractedScreenResolution = !specs.screenResolution ? processScreenResolution(undefined, title) : null;
  
  // For display, prioritize database values but fall back to extracted values
  const displayProcessor = specs.processor || extractedProcessor || 'Not Specified';
  const displayRam = specs.ram || extractedRam || 'Not Specified';
  const displayGraphics = specs.graphics || extractedGraphics || 'Not Specified';
  const displayStorage = specs.storage || extractedStorage || 'Not Specified';
  const displayScreenSize = specs.screenSize || extractedScreenSize || 'Not Specified';
  const displayScreenResolution = specs.screenResolution || extractedScreenResolution || '';
  
  // Log extraction results for debugging
  console.log('Spec extraction from title:', {
    title,
    extractedProcessor,
    extractedRam,
    extractedGraphics,
    extractedStorage,
    extractedScreenSize,
    extractedScreenResolution
  });
  
  return (
    <div>
      <a 
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:text-blue-600 transition-colors"
      >
        <h3 className="font-bold mb-2 line-clamp-2">{title || 'Untitled Laptop'}</h3>
      </a>
      <ul className="space-y-1 text-sm">
        <li>
          <span className="font-bold">Brand:</span>{" "}
          {correctedBrand || 'Not Specified'}
        </li>
        {displayModel && (
          <li>
            <span className="font-bold">Model:</span>{" "}
            {displayModel}
          </li>
        )}
        <li>
          <span className="font-bold">Screen:</span>{" "}
          {displayScreenSize 
            ? `${displayScreenSize} ${displayScreenResolution ? `(${displayScreenResolution})` : ''}`
            : 'Not Specified'}
        </li>
        <li>
          <span className="font-bold">Processor:</span>{" "}
          {displayProcessor}
        </li>
        <li>
          <span className="font-bold">GPU:</span>{" "}
          {displayGraphics}
        </li>
        <li>
          <span className="font-bold">RAM:</span>{" "}
          {displayRam}
        </li>
        <li>
          <span className="font-bold">Storage:</span>{" "}
          {displayStorage}
        </li>
      </ul>
    </div>
  );
}

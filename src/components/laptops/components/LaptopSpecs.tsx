
import { normalizeBrand } from "@/utils/laptop/valueNormalizer";
import { normalizeModel } from "@/utils/laptop/valueNormalizer";
import { extractProcessorFromTitle } from "@/utils/laptop/filter/extractors/processor/processorExtractor";
import { processRam } from "@/utils/laptopUtils/processors/ramProcessor";
import { processGraphics } from "@/utils/laptopUtils/graphicsProcessor";
import { processStorage } from "@/utils/laptopUtils/processors/storageProcessor";
import { processScreenSize } from "@/utils/laptopUtils/physicalSpecsProcessor";
import { processScreenResolution } from "@/utils/laptopUtils/processors/screenProcessor";
import { normalizeGraphics, isHighPerformanceGraphics, isIntegratedGraphics } from "@/utils/laptop/normalizers/graphicsNormalizer";

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
  
  // Apple-specific processor handling for MacBooks
  let displayProcessor = specs.processor || extractedProcessor || 'Not Specified';
  
  // Additional MacBook M-series detection for processor
  if (displayProcessor === 'Not Specified' && title) {
    const titleLower = title.toLowerCase();
    // Check for MacBook with M-series chips
    if (titleLower.includes('macbook') && titleLower.match(/\bm[123]\b/)) {
      const mSeries = titleLower.match(/\bm([123])\b/)?.[1];
      if (mSeries) {
        // Check for Pro/Max/Ultra variants
        if (titleLower.includes(' pro')) {
          displayProcessor = `Apple M${mSeries} Pro chip`;
        } else if (titleLower.includes(' max')) {
          displayProcessor = `Apple M${mSeries} Max chip`;
        } else if (titleLower.includes(' ultra')) {
          displayProcessor = `Apple M${mSeries} Ultra chip`;
        } else {
          displayProcessor = `Apple M${mSeries} chip`;
        }
      }
    }
  }
  
  // Improved graphics extraction and display logic
  let displayGraphics = '';
  
  // First try to use and normalize the existing graphics value from database
  if (specs.graphics) {
    // Check if the graphics value is a generic brand name without model
    const isGenericGpu = /^(nvidia|amd|intel|radeon|graphics)$/i.test(specs.graphics.trim());
    
    if (!isGenericGpu) {
      // If it's not just a generic brand name, use the normalized version
      const normalizedGraphics = normalizeGraphics(specs.graphics);
      if (normalizedGraphics && normalizedGraphics.length > 3) {
        displayGraphics = normalizedGraphics;
      }
    }
  }
  
  // If we don't have a valid graphics value from database or it's too generic, extract from title
  if (!displayGraphics || displayGraphics.length < 5) {
    const extractedGraphics = processGraphics(undefined, title);
    if (extractedGraphics && extractedGraphics.length > 4) {
      displayGraphics = extractedGraphics;
    } else {
      // Final fallback to the original value or "Not Specified"
      displayGraphics = specs.graphics || 'Not Specified';
    }
  }
  
  // Special handling for MacBooks with Apple Silicon
  if (displayGraphics === 'Not Specified' && title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('macbook') && titleLower.match(/\bm[123]\b/)) {
      const mSeries = titleLower.match(/\bm([123])\b/)?.[1];
      if (mSeries) {
        // Check for Pro/Max/Ultra variants
        if (titleLower.includes(' pro')) {
          displayGraphics = `Apple M${mSeries} Pro GPU`;
        } else if (titleLower.includes(' max')) {
          displayGraphics = `Apple M${mSeries} Max GPU`;
        } else if (titleLower.includes(' ultra')) {
          displayGraphics = `Apple M${mSeries} Ultra GPU`;
        } else {
          displayGraphics = `Apple M${mSeries} GPU`;
        }
      }
    }
  }
  
  // Clean up generic brand-only GPU descriptions
  if (/^(nvidia|amd|intel|radeon|graphics)$/i.test(displayGraphics.trim())) {
    const extractedGraphics = processGraphics(undefined, title);
    if (extractedGraphics && extractedGraphics.length > 4) {
      displayGraphics = extractedGraphics;
    }
  }
  
  // Add GPU type indicators for better user understanding
  let gpuType = '';
  if (displayGraphics !== 'Not Specified') {
    if (isHighPerformanceGraphics(displayGraphics)) {
      gpuType = ' (High Performance)';
    } else if (isIntegratedGraphics(displayGraphics)) {
      gpuType = ' (Integrated)';
    } else if (displayGraphics.toLowerCase().includes('nvidia') || 
              displayGraphics.toLowerCase().includes('radeon rx')) {
      gpuType = ' (Dedicated)';
    }
  }
  
  const extractedStorage = !specs.storage ? processStorage(undefined, title) : null;
  const extractedScreenSize = !specs.screenSize ? processScreenSize(undefined, title) : null;
  const extractedScreenResolution = !specs.screenResolution ? processScreenResolution(undefined, title) : null;
  
  // For display, prioritize database values but fall back to extracted values
  const displayRam = specs.ram || extractedRam || 'Not Specified';
  const displayStorage = specs.storage || extractedStorage || 'Not Specified';
  const displayScreenSize = specs.screenSize || extractedScreenSize || 'Not Specified';
  const displayScreenResolution = specs.screenResolution || extractedScreenResolution || '';
  
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
          {displayGraphics}{gpuType}
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

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
  
  // Improved MacBook processor detection
  if ((displayProcessor === 'Not Specified' || displayProcessor === 'Apple') && title) {
    const titleLower = title.toLowerCase();
    // Check for MacBook with M-series chips
    const mSeriesMatch = titleLower.match(/\bm([1234])\s*(pro|max|ultra)?\b/i);
    if (mSeriesMatch && titleLower.includes('macbook')) {
      const mSeries = mSeriesMatch[1];
      const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
      displayProcessor = `Apple M${mSeries}${variant} chip`;
    }
    // If title explicitly mentions "chip", make sure we capture it
    else if (titleLower.match(/apple\s+m[1234]\s+chip/i)) {
      const chipMatch = titleLower.match(/apple\s+m([1234])\s+chip/i);
      if (chipMatch) {
        displayProcessor = `Apple M${chipMatch[1]} chip`;
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
  if ((displayGraphics === 'Not Specified' || displayGraphics.includes('Apple')) && title) {
    const titleLower = title.toLowerCase();
    const mSeriesMatch = titleLower.match(/\bm([1234])\s*(pro|max|ultra)?\b/i);
    if (mSeriesMatch && titleLower.includes('macbook')) {
      const mSeries = mSeriesMatch[1];
      const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
      
      // Check for GPU core count in title (e.g., "10-core GPU")
      const coreMatch = titleLower.match(/(\d+)[\s-]core\s+gpu/i);
      const coreInfo = coreMatch ? ` with ${coreMatch[1]}-core` : '';
      
      displayGraphics = `Apple M${mSeries}${variant}${coreInfo} GPU`;
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
  
  // Enhanced RAM extraction for Apple MacBooks
  let displayRam = specs.ram || extractedRam || 'Not Specified';
  
  // If RAM is "Unified" or missing, try to extract from title for MacBooks
  if ((displayRam === 'Not Specified' || displayRam === 'Unified') && title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('macbook') || brand?.toLowerCase() === 'apple') {
      // Look for GB RAM pattern in MacBook titles
      const ramMatch = titleLower.match(/(\d+)\s*gb(?:\s+unified)?\s+(?:ram|memory)/i);
      if (ramMatch) {
        displayRam = `${ramMatch[1]}GB${titleLower.includes('unified') ? ' Unified' : ''}`;
      }
      // Also try looking for "8GB" pattern
      else {
        const simpleRamMatch = titleLower.match(/(\d+)\s*gb\b(?!\s*(?:ssd|storage|drive))/i);
        if (simpleRamMatch) {
          displayRam = `${simpleRamMatch[1]}GB${titleLower.includes('unified') ? ' Unified' : ''}`;
        }
      }
    }
  }
  
  const extractedStorage = !specs.storage ? processStorage(undefined, title) : null;
  const extractedScreenSize = !specs.screenSize ? processScreenSize(undefined, title) : null;
  const extractedScreenResolution = !specs.screenResolution ? processScreenResolution(undefined, title) : null;
  
  // For display, prioritize database values but fall back to extracted values
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

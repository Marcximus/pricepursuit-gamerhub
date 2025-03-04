
import { processGraphics, isDedicatedGraphics } from "@/utils/laptopUtils/graphics";
import { normalizeGraphics, isHighPerformanceGraphics, isIntegratedGraphics } from "@/utils/laptop/normalizers/graphics";
import { getAppleSiliconGraphics } from "./ProcessorUtils";

type GraphicsSpecProps = {
  title: string;
  graphics?: string;
};

export function GraphicsSpec({ title, graphics }: GraphicsSpecProps) {
  // Improved graphics extraction and display logic
  let displayGraphics = '';
  
  // First check if this is an Apple laptop with existing graphics information in database
  const isAppleLaptop = title.toLowerCase().includes('apple') || 
                        title.toLowerCase().includes('macbook') ||
                        title.toLowerCase().includes('mac book');
  
  if (isAppleLaptop && graphics && graphics.toLowerCase().includes('apple')) {
    // Use the existing Apple GPU data from database directly
    displayGraphics = graphics;
  } else if (graphics) {
    // For non-Apple or Apple laptops without specific GPU info, use normal flow
    // Check if the graphics value is a generic brand name without model
    const isGenericGpu = /^(nvidia|amd|intel|radeon|graphics)$/i.test(graphics.trim());
    
    if (!isGenericGpu) {
      // If it's not just a generic brand name, use the normalized version
      const normalizedGraphics = normalizeGraphics(graphics);
      if (normalizedGraphics && normalizedGraphics.length > 3) {
        displayGraphics = normalizedGraphics;
      }
    }
  }
  
  // If we don't have a valid graphics value from database or it's too generic, extract from title
  if (!displayGraphics || displayGraphics.length < 5) {
    const extractedGraphics = processGraphics(graphics, title);
    if (extractedGraphics && extractedGraphics.length > 4) {
      displayGraphics = extractedGraphics;
    } else {
      // Check title for Intel HD Graphics patterns
      const intelHdMatch = title.match(/Intel\s+(?:HD|UHD)?\s*Graphics\s*(\d+)?/i);
      if (intelHdMatch) {
        displayGraphics = intelHdMatch[0];
      } else {
        // Final fallback to the original value or "Not Specified"
        displayGraphics = graphics || 'Not Specified';
      }
    }
  }
  
  // Special handling for MacBooks with Apple Silicon if we still don't have specific info
  if ((displayGraphics === 'Not Specified' || !displayGraphics.includes('Apple')) && 
      (title.toLowerCase().includes('apple') || title.toLowerCase().includes('macbook'))) {
    const appleSiliconGraphics = getAppleSiliconGraphics(title);
    if (appleSiliconGraphics) {
      displayGraphics = appleSiliconGraphics;
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
  
  return (
    <li>
      <span className="font-bold">GPU:</span>{" "}
      {displayGraphics}{gpuType}
    </li>
  );
}

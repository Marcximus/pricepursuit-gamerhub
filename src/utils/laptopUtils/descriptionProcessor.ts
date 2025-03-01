/**
 * Process laptop description to extract additional specifications
 * that might not be present in the title
 */

import { 
  processProcessor, 
  processRam, 
  processStorage, 
  processScreenResolution, 
  processRefreshRate, 
  processTouchscreen, 
  processOperatingSystem, 
  processColor, 
  processWarranty, 
  processOfficeIncluded,
  processBacklitKeyboard, 
  processPorts, 
  processFingerprint 
} from './processors';

import { processGraphics } from './graphicsProcessor';
import { 
  processScreenSize, 
  processWeight, 
  processBatteryLife, 
  processCamera,
} from './physicalSpecsProcessor';

import { processColor as physicalProcessorColor,
         processTouchscreen as physicalProcessorTouchscreen,
         processBacklitKeyboard as physicalProcessorBacklitKeyboard,
         processFingerprint as physicalProcessorFingerprint,
         processPorts as physicalProcessorPorts } from './physicalSpecsProcessor';

import { processTouchscreen as specsProcessorTouchscreen,
         processColor as specsProcessorColor,
         processBacklitKeyboard as specsProcessorBacklitKeyboard,
         processPorts as specsProcessorPorts,
         processFingerprint as specsProcessorFingerprint } from './processors';

/**
 * Process laptop description to extract additional specifications
 * that might not be present in the title
 */
export const processLaptopDescription = (description: string | undefined, title: string, existingSpecs: any) => {
  if (!description || typeof description !== 'string' || description.length < 10) {
    return existingSpecs;
  }
  
  // Clean up description
  const cleanDescription = description
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`Processing description for laptop "${title.substring(0, 50)}..." (${cleanDescription.length} chars)`);
  
  // Create a new specs object starting with existing specs
  const enhancedSpecs = { ...existingSpecs };
  
  // Try to extract missing specs from description
  if (!enhancedSpecs.processor) {
    enhancedSpecs.processor = processProcessor(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.ram) {
    enhancedSpecs.ram = processRam(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.storage) {
    enhancedSpecs.storage = processStorage(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.graphics) {
    enhancedSpecs.graphics = processGraphics(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.screen_size) {
    enhancedSpecs.screen_size = processScreenSize(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.screen_resolution) {
    enhancedSpecs.screen_resolution = processScreenResolution(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.weight) {
    enhancedSpecs.weight = processWeight(undefined, `${title} ${cleanDescription}`);
  }
  
  if (!enhancedSpecs.battery_life) {
    enhancedSpecs.battery_life = processBatteryLife(undefined, `${title} ${cleanDescription}`);
  }
  
  // Extract additional specs that might not be in the basic specs
  // First try with specsProcessor, then fallback to physicalSpecsProcessor for more thorough extraction
  enhancedSpecs.refresh_rate = enhancedSpecs.refresh_rate || processRefreshRate(title, cleanDescription);
  
  // For touchscreen detection, try both processors
  enhancedSpecs.touchscreen = enhancedSpecs.touchscreen !== undefined ? 
                            enhancedSpecs.touchscreen : 
                            specsProcessorTouchscreen(title, cleanDescription);
  if (enhancedSpecs.touchscreen === undefined) {
    enhancedSpecs.touchscreen = physicalProcessorTouchscreen(undefined, `${title} ${cleanDescription}`);
  }
  
  enhancedSpecs.operating_system = enhancedSpecs.operating_system || processOperatingSystem(title, cleanDescription);
  
  // For color detection, try both processors
  enhancedSpecs.color = enhancedSpecs.color || specsProcessorColor(title, cleanDescription);
  if (!enhancedSpecs.color) {
    enhancedSpecs.color = physicalProcessorColor(undefined, `${title} ${cleanDescription}`);
  }
  
  enhancedSpecs.warranty = enhancedSpecs.warranty || processWarranty(title, cleanDescription);
  enhancedSpecs.office_included = enhancedSpecs.office_included !== undefined ? 
                                enhancedSpecs.office_included : 
                                processOfficeIncluded(title, cleanDescription);
  
  // For backlit keyboard detection, try both processors
  enhancedSpecs.backlit_keyboard = enhancedSpecs.backlit_keyboard !== undefined ? 
                                 enhancedSpecs.backlit_keyboard : 
                                 specsProcessorBacklitKeyboard(title, cleanDescription);
  if (enhancedSpecs.backlit_keyboard === undefined) {
    enhancedSpecs.backlit_keyboard = physicalProcessorBacklitKeyboard(undefined, `${title} ${cleanDescription}`);
  }
  
  // For ports detection, try both processors
  const specsProcessorPortsResult = specsProcessorPorts(title, cleanDescription);
  const physicalProcessorPortsResult = physicalProcessorPorts(undefined, `${title} ${cleanDescription}`);
  enhancedSpecs.ports = enhancedSpecs.ports || specsProcessorPortsResult || physicalProcessorPortsResult;
  
  // For fingerprint detection, try both processors
  enhancedSpecs.fingerprint = enhancedSpecs.fingerprint !== undefined ? 
                            enhancedSpecs.fingerprint : 
                            specsProcessorFingerprint(title, cleanDescription);
  if (enhancedSpecs.fingerprint === undefined) {
    enhancedSpecs.fingerprint = physicalProcessorFingerprint(undefined, `${title} ${cleanDescription}`);
  }
  
  // Add camera information
  enhancedSpecs.camera = enhancedSpecs.camera || processCamera(undefined, `${title} ${cleanDescription}`);
  
  // Log enhanced specs for debugging
  console.log('Enhanced specs from description:', {
    processor: enhancedSpecs.processor !== existingSpecs.processor,
    ram: enhancedSpecs.ram !== existingSpecs.ram,
    storage: enhancedSpecs.storage !== existingSpecs.storage,
    graphics: enhancedSpecs.graphics !== existingSpecs.graphics,
    screen_size: enhancedSpecs.screen_size !== existingSpecs.screen_size,
    screen_resolution: enhancedSpecs.screen_resolution !== existingSpecs.screen_resolution
  });
  
  return enhancedSpecs;
};

// Helper function to determine if a laptop has premium features
export const hasPremiumFeatures = (specs: any): boolean => {
  // Check for premium processors
  const hasPremiumProcessor = specs.processor && (
    /i7|i9|ryzen 7|ryzen 9|M2 Pro|M2 Max|M3 Pro|M3 Max|Ultra/i.test(specs.processor)
  );
  
  // Check for high RAM
  const hasHighRam = specs.ram && (
    parseInt(specs.ram.replace(/GB.*/i, ''), 10) >= 16
  );
  
  // Check for SSD storage
  const hasSSD = specs.storage && (
    /SSD|NVMe|PCIe/i.test(specs.storage)
  );
  
  // Check for dedicated graphics
  const hasDedicatedGraphics = specs.graphics && (
    /RTX|GTX|RX|Radeon Pro/i.test(specs.graphics) && 
    !/Intel|AMD Radeon Graphics/i.test(specs.graphics)
  );
  
  // Check for high-res display
  const hasHighResDisplay = specs.screen_resolution && (
    /4K|UHD|QHD|2K|Retina/i.test(specs.screen_resolution)
  );
  
  // Check for premium features
  const hasPremiumFeatures = 
    (specs.touchscreen === true) ||
    (specs.backlit_keyboard === true) ||
    (specs.fingerprint === true) ||
    (specs.refresh_rate && specs.refresh_rate > 60) ||
    (specs.color && /Gold|Rose Gold|Space Gray/i.test(specs.color)) ||
    (specs.battery_life && parseInt(specs.battery_life.replace(/hours.*/i, ''), 10) >= 12);
  
  // A laptop is considered premium if it has at least 3 of the premium indicators
  let premiumScore = 0;
  if (hasPremiumProcessor) premiumScore++;
  if (hasHighRam) premiumScore++;
  if (hasSSD) premiumScore++;
  if (hasDedicatedGraphics) premiumScore++;
  if (hasHighResDisplay) premiumScore++;
  if (hasPremiumFeatures) premiumScore++;
  
  console.log('Premium score:', premiumScore, {
    hasPremiumProcessor,
    hasHighRam,
    hasSSD,
    hasDedicatedGraphics,
    hasHighResDisplay,
    hasPremiumFeatures
  });
  
  return premiumScore >= 3;
};

/**
 * Generate a score for the laptop based on its specifications
 * This can be used for ranking laptops by quality
 */
export const generateLaptopScore = (specs: any): number => {
  let score = 0;
  
  // Processor score (0-30 points)
  if (specs.processor) {
    // High-end processors
    if (/i9|ryzen 9|M3 Max|M3 Ultra/i.test(specs.processor)) {
      score += 30;
    } 
    // Mid-to-high-end processors
    else if (/i7|ryzen 7|M3 Pro|M2 Max/i.test(specs.processor)) {
      score += 25;
    }
    // Mid-range processors
    else if (/i5|ryzen 5|M3|M2 Pro/i.test(specs.processor)) {
      score += 20;
    }
    // Entry-level processors
    else if (/i3|ryzen 3|M2|M1/i.test(specs.processor)) {
      score += 15;
    }
    // Budget processors
    else if (/celeron|pentium|atom/i.test(specs.processor)) {
      score += 5;
    }
    // Unknown but has a processor
    else {
      score += 10;
    }
  }
  
  // RAM score (0-20 points)
  if (specs.ram) {
    const ramMatch = specs.ram.match(/(\d+)\s*GB/i);
    if (ramMatch) {
      const ramSize = parseInt(ramMatch[1], 10);
      if (ramSize >= 32) {
        score += 20;
      } else if (ramSize >= 16) {
        score += 15;
      } else if (ramSize >= 8) {
        score += 10;
      } else if (ramSize >= 4) {
        score += 5;
      }
    }
  }
  
  // Storage score (0-15 points)
  if (specs.storage) {
    // SSD type (NVMe/PCIe is better than regular SSD)
    if (/NVMe|PCIe/i.test(specs.storage)) {
      score += 5;
    } else if (/SSD/i.test(specs.storage)) {
      score += 3;
    }
    
    // Storage capacity
    const tbMatch = specs.storage.match(/(\d+(?:\.\d+)?)\s*TB/i);
    const gbMatch = specs.storage.match(/(\d+)\s*GB/i);
    
    if (tbMatch) {
      const tbSize = parseFloat(tbMatch[1]);
      if (tbSize >= 2) {
        score += 10;
      } else if (tbSize >= 1) {
        score += 8;
      } else {
        score += 6;
      }
    } else if (gbMatch) {
      const gbSize = parseInt(gbMatch[1], 10);
      if (gbSize >= 1000) {
        score += 8;
      } else if (gbSize >= 512) {
        score += 6;
      } else if (gbSize >= 256) {
        score += 4;
      } else if (gbSize >= 128) {
        score += 2;
      }
    }
  }
  
  // Graphics score (0-15 points)
  if (specs.graphics) {
    // High-end dedicated graphics
    if (/RTX\s*4\d{3}/i.test(specs.graphics) || /Radeon\s*RX\s*7\d{3}/i.test(specs.graphics)) {
      score += 15;
    }
    // Mid-to-high-end dedicated graphics
    else if (/RTX\s*3\d{3}/i.test(specs.graphics) || /Radeon\s*RX\s*6\d{3}/i.test(specs.graphics)) {
      score += 12;
    }
    // Mid-range dedicated graphics
    else if (/RTX\s*2\d{3}/i.test(specs.graphics) || /GTX\s*16\d{2}/i.test(specs.graphics)) {
      score += 10;
    }
    // Entry-level dedicated graphics
    else if (/GTX\s*\d{3,4}/i.test(specs.graphics) || /Radeon\s*\d{3,4}/i.test(specs.graphics)) {
      score += 8;
    }
    // Integrated graphics (better than nothing)
    else if (/Intel\s*Iris/i.test(specs.graphics) || /UHD/i.test(specs.graphics)) {
      score += 5;
    }
    // Apple integrated graphics
    else if (/Apple\s*M\d/i.test(specs.graphics)) {
      score += 7;
    }
    // Has graphics but unknown
    else {
      score += 3;
    }
  }
  
  // Screen resolution score (0-10 points)
  if (specs.screen_resolution) {
    if (/4K|UHD|3840\s*x\s*2160/i.test(specs.screen_resolution)) {
      score += 10;
    } else if (/QHD|2K|2560\s*x\s*1440/i.test(specs.screen_resolution)) {
      score += 8;
    } else if (/FHD|1080p|1920\s*x\s*1080/i.test(specs.screen_resolution)) {
      score += 6;
    } else if (/HD|1366\s*x\s*768/i.test(specs.screen_resolution)) {
      score += 3;
    } else if (/Retina/i.test(specs.screen_resolution)) {
      score += 7;
    }
  }
  
  // Refresh rate score (0-5 points)
  if (specs.refresh_rate) {
    const refreshRate = typeof specs.refresh_rate === 'number' ? 
                       specs.refresh_rate : 
                       parseInt(specs.refresh_rate, 10);
    if (refreshRate >= 240) {
      score += 5;
    } else if (refreshRate >= 144) {
      score += 4;
    } else if (refreshRate >= 120) {
      score += 3;
    } else if (refreshRate >= 90) {
      score += 2;
    } else if (refreshRate >= 60) {
      score += 1;
    }
  }
  
  // Additional premium features (0-5 points)
  let additionalFeatures = 0;
  
  if (specs.touchscreen === true) additionalFeatures++;
  if (specs.backlit_keyboard === true) additionalFeatures++;
  if (specs.fingerprint === true) additionalFeatures++;
  
  // Award points based on number of premium features
  if (additionalFeatures >= 3) {
    score += 5;
  } else if (additionalFeatures === 2) {
    score += 3;
  } else if (additionalFeatures === 1) {
    score += 1;
  }
  
  return score;
};

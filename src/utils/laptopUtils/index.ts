
/**
 * Central export file for laptop utilities
 * Refactored for better organization and maintainability
 */

// Core processing logic
export { processLaptopData } from './core/laptopProcessor';

// Title processing
export { processTitle } from './titleProcessor';

// Import and re-export from specialized modules
export { 
  processProcessor,
  processRam,
  processStorage,
  processScreenResolution,
  processRefreshRate,
  processOperatingSystem,
  processWarranty,
  processOfficeIncluded
} from './specsProcessor';

export { processGraphics } from './graphicsProcessor';

export {
  processScreenSize,
  processWeight,
  processBatteryLife,
  processCamera
} from './physicalSpecsProcessor';

export {
  processLaptopDescription,
  hasPremiumFeatures,
  generateLaptopScore
} from './descriptionProcessor';

// Export feature-related processors with clear namespacing
export {
  processColor as specsProcessorColor,
  processTouchscreen as specsProcessorTouchscreen,
  processBacklitKeyboard as specsProcessorBacklitKeyboard,
  processPorts as specsProcessorPorts,
  processFingerprint as specsProcessorFingerprint
} from './specsProcessor';

export {
  processColor as physicalProcessorColor,
  processTouchscreen as physicalProcessorTouchscreen,
  processBacklitKeyboard as physicalProcessorBacklitKeyboard,
  processPorts as physicalProcessorPorts,
  processFingerprint as physicalProcessorFingerprint
} from './physicalSpecsProcessor';

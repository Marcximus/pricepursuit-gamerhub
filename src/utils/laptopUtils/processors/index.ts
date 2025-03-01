
/**
 * Export all processor functions from one central file
 */

// Processor related
export { processProcessor } from './processorProcessor';

// RAM related
export { processRam } from './ramProcessor';

// Storage related
export { processStorage } from './storageProcessor';

// Screen related
export { 
  processScreenResolution,
  processRefreshRate 
} from './screenProcessor';

// Features related
export { 
  processTouchscreen,
  processOperatingSystem,
  processColor,
  processWarranty,
  processOfficeIncluded 
} from './featureProcessor';

// Peripherals related
export { 
  processBacklitKeyboard,
  processPorts,
  processFingerprint 
} from './peripheralProcessor';

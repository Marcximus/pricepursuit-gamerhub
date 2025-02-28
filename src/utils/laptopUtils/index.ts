
// This is now a barrel file that re-exports all functionality from the specialized modules
import { processLaptopData } from './laptopDataProcessor';
import { processTitle } from './titleProcessor';
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
} from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { 
  processScreenSize,
  processWeight,
  processBatteryLife,
  processCamera,
  processColor as physicalProcessorColor,
  processTouchscreen as physicalProcessorTouchscreen,
  processBacklitKeyboard as physicalProcessorBacklitKeyboard,
  processPorts as physicalProcessorPorts,
  processFingerprint as physicalProcessorFingerprint
} from './physicalSpecsProcessor';
import { 
  processLaptopDescription,
  hasPremiumFeatures,
  generateLaptopScore
} from './descriptionProcessor';

// Export everything
export {
  processLaptopData,
  processTitle,
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
  processFingerprint,
  processGraphics,
  processScreenSize,
  processWeight,
  processBatteryLife,
  processCamera,
  processLaptopDescription,
  hasPremiumFeatures,
  generateLaptopScore,
  // Re-export with disambiguated names
  processColor as specsProcessorColor,
  processTouchscreen as specsProcessorTouchscreen,
  processBacklitKeyboard as specsProcessorBacklitKeyboard,
  processPorts as specsProcessorPorts,
  processFingerprint as specsProcessorFingerprint,
  physicalProcessorColor,
  physicalProcessorTouchscreen,
  physicalProcessorBacklitKeyboard,
  physicalProcessorPorts,
  physicalProcessorFingerprint
};

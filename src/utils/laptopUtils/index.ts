
import { processTitle } from './titleProcessor';
import { processProcessor, processRam, processStorage, processScreenResolution, 
         processRefreshRate, processTouchscreen, processOperatingSystem, 
         processColor, processWarranty, processOfficeIncluded,
         processBacklitKeyboard, processPorts, processFingerprint } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife, processCamera } from './physicalSpecsProcessor';
import { processLaptopDescription, hasPremiumFeatures, generateLaptopScore } from './descriptionProcessor';
import { normalizeBrand } from '@/utils/laptop/normalizers/brandNormalizer';
import { normalizeModel } from '@/utils/laptop/normalizers/modelNormalizer';
import type { Product } from "@/types/product";
import { processLaptopData } from './dataProcessor';
import type { LaptopSpecs } from './types';

// Define a type for the specs object to ensure it has all required properties
export type { LaptopSpecs };

/**
 * Process and create the laptop product object with improved specification extraction
 */
export { processLaptopData };

// Selectively export necessary functions to avoid ambiguity
export { processTitle } from './titleProcessor';
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

// Handle ambiguous exports by renaming them
import {
  processColor as specsProcessorColor,
  processTouchscreen as specsProcessorTouchscreen,
  processBacklitKeyboard as specsProcessorBacklitKeyboard,
  processPorts as specsProcessorPorts,
  processFingerprint as specsProcessorFingerprint
} from './specsProcessor';

import {
  processColor as physicalProcessorColor,
  processTouchscreen as physicalProcessorTouchscreen,
  processBacklitKeyboard as physicalProcessorBacklitKeyboard,
  processPorts as physicalProcessorPorts,
  processFingerprint as physicalProcessorFingerprint
} from './physicalSpecsProcessor';

// Re-export with clear, disambiguated names
export {
  specsProcessorColor,
  specsProcessorTouchscreen,
  specsProcessorBacklitKeyboard,
  specsProcessorPorts,
  specsProcessorFingerprint,
  physicalProcessorColor,
  physicalProcessorTouchscreen,
  physicalProcessorBacklitKeyboard,
  physicalProcessorPorts,
  physicalProcessorFingerprint
};

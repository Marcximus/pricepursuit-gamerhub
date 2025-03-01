
/**
 * Central exports file for spec processor functions
 * Refactored to import from specialized processor files
 */

export { 
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

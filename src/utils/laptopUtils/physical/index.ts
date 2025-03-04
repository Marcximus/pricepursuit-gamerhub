
/**
 * Export all physical spec processor functions from one central file
 */

// Screen related
export { processScreenSize } from './screenProcessor';

// Weight related
export { processWeight } from './weightProcessor';

// Battery related
export { processBatteryLife } from './batteryProcessor';

// Camera related
export { processCamera } from './cameraProcessor';

// Color related
export { processColor } from './colorProcessor';

// Touchscreen related
export { processTouchscreen } from './touchscreenProcessor';

// Physical features related 
export { 
  processBacklitKeyboard,
  processPorts,
  processFingerprint
} from './peripheralProcessor';

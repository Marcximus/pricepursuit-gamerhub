
/**
 * This file is now a re-export of the refactored parsers
 * for backward compatibility.
 */

import { 
  getRamValue 
} from './parsers/ramParser';

import { 
  getStorageValue 
} from './parsers/storageParser';

import { 
  getScreenSizeValue 
} from './parsers/screenSizeParser';

import { 
  getCoreCount 
} from './parsers/processorParser';

// Re-export all functions for backward compatibility
export {
  getRamValue,
  getStorageValue,
  getScreenSizeValue,
  getCoreCount
};
